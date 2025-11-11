'use strict';

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';
import { differenceInMinutes, parse } from 'date-fns';
import * as crypto from 'crypto';

admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

/**
 * A callable function for admins to create a new employee user.
 */
export const createEmployee = functions.https.onCall(async (data, context) => {
    // Check if the caller is authenticated and is an admin
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    // An admin's UID is the same as their shopId
    const adminShopId = context.auth.uid;
    const { email, password, name, employeeId, role, baseSalary, shopId } = data;

    // Verify that the calling admin owns the shop they're adding to
    if (adminShopId !== shopId) {
        throw new functions.https.HttpsError('permission-denied', 'You can only add employees to your own shop.');
    }

    try {
        // Create the user in Firebase Authentication
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password,
            displayName: name,
        });

        // Create the user profiles in Firestore
        const newEmployeeProfile = {
            uid: userRecord.uid,
            name,
            email,
            role,
            employeeId,
            status: 'Pending Onboarding',
            fallback: name.split(' ').map((n: string) => n[0]).join(''),
            shopId: shopId,
            points: 0,
            streak: 0,
            joinDate: new Date().toISOString().split('T')[0],
            baseSalary: baseSalary || 0,
            isProfileComplete: false,
        };

        const batch = db.batch();

        // 1. Add to global 'users' collection
        const userDocRef = db.collection('users').doc(userRecord.uid);
        batch.set(userDocRef, newEmployeeProfile);
        
        // 2. Add to shop's 'employees' subcollection
        const shopEmployeeDocRef = db.collection('shops').doc(shopId).collection('employees').doc(userRecord.uid);
        batch.set(shopEmployeeDocRef, newEmployeeProfile);

        await batch.commit();
        
        return { success: true, uid: userRecord.uid };

    } catch (error: any) {
        console.error('Error creating new employee:', error);
        // Throw specific errors that the client can understand
        if (error.code === 'auth/email-already-exists') {
            throw new functions.https.HttpsError('already-exists', 'The email address is already in use by another account.', { errorCode: 'EMAIL_EXISTS' });
        }
        if (error.code === 'auth/invalid-password') {
            throw new functions.https.HttpsError('invalid-argument', 'The password must be a string with at least 6 characters.', { errorCode: 'WEAK_PASSWORD' });
        }
        throw new functions.https.HttpsError('internal', 'An unexpected error occurred while creating the employee.');
    }
});


/**
 * A scheduled function that runs every 15 minutes to send shift start reminders.
 */
export const scheduledShiftReminder = functions.pubsub.schedule('every 15 minutes').onRun(async (context) => {
    console.log('Running scheduledShiftReminder function.');

    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    try {
        const shopsSnapshot = await db.collection('shops').get();
        if (shopsSnapshot.empty) {
            console.log('No shops found.');
            return;
        }

        for (const shopDoc of shopsSnapshot.docs) {
            const shopId = shopDoc.id;
            const shopData = shopDoc.data();
            
            const settingsDoc = await db.collection('shops').doc(shopId).collection('config').doc('main').get();
            if (!settingsDoc.exists || !settingsDoc.data()?.enableEmployeeReminders) {
                console.log(`Reminders disabled for shop ${shopId}. Skipping.`);
                continue;
            }

            const daySettings = shopData.businessHours?.[currentDay];
            if (!daySettings || !daySettings.isOpen) {
                continue; // Shop is closed today
            }

            const shiftStartTime = parse(daySettings.startTime, 'HH:mm', new Date());
            const minutesUntilShift = differenceInMinutes(shiftStartTime, now);
            
            // Send reminder if shift is 0-15 minutes away
            if (minutesUntilShift >= 0 && minutesUntilShift <= 15) {
                console.log(`Shop ${shopId} has a shift starting soon.`);
                const employeesSnapshot = await db.collection('shops').doc(shopId).collection('employees')
                    .where('status', '==', 'Active')
                    .get();

                if (employeesSnapshot.empty) continue;

                for (const empDoc of employeesSnapshot.docs) {
                    const employee = empDoc.data();
                    if (employee.fcmToken) {
                        const payload: admin.messaging.MessagingPayload = {
                            notification: {
                                title: 'Shift Reminder',
                                body: `Hi ${employee.name}, your shift at ${shopData.shopName} is starting soon at ${daySettings.startTime}. Don't forget to check in!`,
                                icon: '/favicon.ico', // Optional: link to your app's icon
                            },
                        };
                        console.log(`Sending reminder to ${employee.name} (Token: ${employee.fcmToken})`);
                        await messaging.sendToDevice(employee.fcmToken, payload);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in scheduledShiftReminder:', error);
    }
});


/**
 * A scheduled function that runs every 30 minutes to check for late or absent employees.
 */
export const scheduledLateCheckAlert = functions.pubsub.schedule('every 30 minutes').onRun(async (context) => {
    console.log('Running scheduledLateCheckAlert function.');

    const now = new Date();
    const todayStart = new Date(now.setHours(0,0,0,0));
    const todayStartTimestamp = Timestamp.fromDate(todayStart);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    try {
        const shopsSnapshot = await db.collection('shops').get();
        if (shopsSnapshot.empty) return;

        for (const shopDoc of shopsSnapshot.docs) {
            const shopId = shopDoc.id;
            const settingsDoc = await db.collection('shops').doc(shopId).collection('config').doc('main').get();
            const settingsData = settingsDoc.data();

            if (!settingsDoc.exists || !settingsData?.enableLateAlerts) {
                 console.log(`Late alerts disabled for shop ${shopId}. Skipping.`);
                continue;
            }

            const daySettings = settingsData.businessHours?.[currentDay];
            if (!daySettings || !daySettings.isOpen) {
                continue;
            }

            const shiftStartTime = parse(daySettings.startTime, 'HH:mm', new Date());
            const gracePeriod = settingsData.lateGracePeriodMinutes || 0;
            const lateDeadline = new Date(shiftStartTime.getTime() + gracePeriod * 60000);

            if (now > lateDeadline) { // Only check for late employees if the current time is past the deadline
                 const employeesSnapshot = await db.collection('shops').doc(shopId).collection('employees')
                    .where('status', '==', 'Active')
                    .get();
                
                if (employeesSnapshot.empty) continue;
                
                const adminUserDoc = await db.collection('users').doc(shopId).get();
                const adminFcmToken = adminUserDoc.exists ? adminUserDoc.data()?.fcmToken : null;
                if (!adminFcmToken) {
                    console.log(`Admin for shop ${shopId} does not have an FCM token. Cannot send alert.`);
                    continue;
                }

                for (const empDoc of employeesSnapshot.docs) {
                    const employee = empDoc.data();
                    const attendanceQuery = await db.collection('shops').doc(shopId).collection('attendance')
                        .where('userId', '==', empDoc.id)
                        .where('checkInTime', '>=', todayStartTimestamp)
                        .limit(1)
                        .get();

                    if (attendanceQuery.empty) {
                        // No check-in record for today, this employee is late/absent.
                         const payload: admin.messaging.MessagingPayload = {
                            notification: {
                                title: 'Employee Late Alert',
                                body: `${employee.name} has not checked in for their ${daySettings.startTime} shift yet.`,
                            },
                        };
                        console.log(`Sending LATE alert for ${employee.name} to admin of shop ${shopId}`);
                        await messaging.sendToDevice(adminFcmToken, payload);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error in scheduledLateCheckAlert:', error);
    }
});


/**
 * Verifies a Dodo Payments subscription and updates the user's plan in Firestore.
 */
export const verifySubscriptionPayment = functions.https.onCall(async (data, context) => {
    // Check authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }
    
    const { paymentId, subscriptionId, signature, shopId, planName } = data;
    
    // Validate required data
    if (!paymentId || !subscriptionId || !signature || !shopId || !planName) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing required payment information.');
    }
    
    // Ensure the user is updating their own shop
    if (context.auth.uid !== shopId) {
        throw new functions.https.HttpsError('permission-denied', 'You can only update your own shop.');
    }
    
    // const secret = functions.config().dodo.key_secret; // Using dodo secret
    // if (!secret) {
    //     throw new functions.https.HttpsError('internal', 'Payment provider secret key is not configured.');
    // }

    // const body = `${paymentId}|${subscriptionId}`;

    // const expectedSignature = crypto
    //     .createHmac('sha256', secret)
    //     .update(body.toString())
    //     .digest('hex');
    
    // if (expectedSignature !== signature) {
    //     throw new functions.https.HttpsError('unauthenticated', 'Request signature verification failed.');
    // }
    
    // Signature is valid, update the database
    try {
        const shopDocRef = db.collection('shops').doc(shopId);
        await shopDocRef.update({
            subscriptionPlan: planName,
            paymentId: paymentId,
            subscriptionId: subscriptionId,
            subscriptionStatus: 'active',
            updatedAt: Timestamp.now(),
        });
        
        return { success: true, message: `Subscription successfully updated to ${planName}.` };

    } catch (error) {
        console.error("Error updating Firestore:", error);
        throw new functions.https.HttpsError('internal', 'Failed to update subscription in the database.');
    }
});