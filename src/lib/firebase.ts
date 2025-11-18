
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth as getFirebaseAuth, type Auth } from "firebase/auth";
import { getFirestore as getFirebaseFirestore, type Firestore } from "firebase/firestore";
import { getStorage as getFirebaseStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging as getFirebaseMessaging, getToken, type Messaging } from "firebase/messaging";
import { getFunctions as getFirebaseFunctions, type Functions } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let messaging: Messaging | null = null;

function initializeFirebase() {
  if (typeof window !== "undefined") {
    if (!getApps().length) {
      app = initializeApp(firebaseConfig);
    } else {
      app = getApp();
    }
    auth = getFirebaseAuth(app);
    db = getFirebaseFirestore(app);
    storage = getFirebaseStorage(app);
    functions = getFirebaseFunctions(app);
    if (typeof window !== 'undefined' && "Notification" in window) {
      messaging = getFirebaseMessaging(app);
    }
  }
}

// Initialize on load (client-side only)
initializeFirebase();

const requestForToken = async () => {
    if (!messaging) {
        console.log("Firebase Messaging is not available in this environment.");
        return null;
    }
    
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
    if (!vapidKey) {
        console.error("VAPID key not found. Please set NEXT_PUBLIC_VAPID_KEY in your environment variables.");
        return null;
    }

    try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            const currentToken = await getToken(messaging, { vapidKey });
            if (currentToken) {
                return currentToken;
            } else {
                console.log('No registration token available. Request permission to generate one.');
                return null;
            }
        } else {
            console.log('Unable to get permission to notify.');
            return null;
        }
    } catch (err) {
        console.log('An error occurred while retrieving token. ', err);
        return null;
    }
};

export { app, auth, db, storage, functions, messaging, requestForToken };
