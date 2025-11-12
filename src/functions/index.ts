
import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, writeBatch } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";

// Initialize Firebase Admin SDK
initializeApp();

export const createEmployee = onCall(async (request) => {
  // Check if the user is authenticated (is a shop owner)
  if (!request.auth) {
    throw new HttpsError(
      "unauthenticated",
      "The function must be called while authenticated."
    );
  }

  const {
    name,
    email,
    password,
    role,
    employeeId,
    baseSalary,
    shopId,
  } = request.data;
  const ownerUid = request.auth.uid;

  // Validate that the caller is the owner of the shop they're adding to
  const firestore = getFirestore();
  const shopDocRef = firestore.doc(`shops/${shopId}`);
  const shopDoc = await shopDocRef.get();

  if (!shopDoc.exists || shopDoc.data()?.ownerId !== ownerUid) {
     throw new HttpsError(
      "permission-denied",
      "You do not have permission to add employees to this shop."
    );
  }

  try {
    // 1. Create user in Firebase Authentication
    const auth = getAuth();
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name,
    });
    
    // 2. Prepare user documents for Firestore
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

    // 3. Use a batch write to save to both collections atomically
    const batch = firestore.batch();

    const userDocRef = firestore.doc(`users/${userRecord.uid}`);
    batch.set(userDocRef, newEmployeeProfile);

    const shopEmployeeDocRef = firestore.doc(`shops/${shopId}/employees/${userRecord.uid}`);
    batch.set(shopEmployeeDocRef, newEmployeeProfile);

    await batch.commit();

    return { result: `Successfully created new employee ${name} with UID ${userRecord.uid}` };

  } catch (error: any) {
    // Handle specific auth errors
    if (error.code === 'auth/email-already-exists') {
        throw new HttpsError('already-exists', 'The email address is already in use by another account.');
    }
    if (error.code === 'auth/weak-password') {
        throw new HttpsError('invalid-argument', 'The password must be at least 6 characters long.');
    }
    // Generic error for other issues
    throw new HttpsError('internal', 'An unexpected error occurred while creating the employee.', error);
  }
});
