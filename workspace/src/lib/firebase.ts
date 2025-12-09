
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth as getFirebaseAuth, type Auth } from "firebase/auth";
import { getFirestore as getFirebaseFirestore, type Firestore } from "firebase/firestore";
import { getStorage as getFirebaseStorage, type FirebaseStorage } from "firebase/storage";
import { getMessaging as getFirebaseMessaging, getToken, type Messaging } from "firebase/messaging";
import { getFunctions as getFirebaseFunctions, type Functions } from "firebase/functions";
import { getAnalytics, type Analytics } from "firebase/analytics";


// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyA7HLhCmNQ1Pqq0hdfz28fv1uD7EgmhnZY",
  authDomain: "attendry-a6f9b.firebaseapp.com",
  projectId: "attendry-a6f9b",
  storageBucket: "attendry-a6f9b.appspot.com",
  messagingSenderId: "166352358207",
  appId: "1:166352358207:web:c663ad6c38352dc831218a",
  measurementId: "G-6GEVRXQL9M"
};


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let functions: Functions;
let messaging: Messaging | null = null;
let analytics: Analytics | null = null;


if (typeof window !== 'undefined' && !getApps().length) {
    app = initializeApp(firebaseConfig);
    auth = getFirebaseAuth(app);
    db = getFirebaseFirestore(app);
    storage = getFirebaseStorage(app);
    functions = getFirebaseFunctions(app);
    analytics = getAnalytics(app);
    if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
      messaging = getFirebaseMessaging(app);
    }
} else if (!getApps().length) {
    // For server-side rendering
    app = initializeApp(firebaseConfig);
    auth = getFirebaseAuth(app);
    db = getFirebaseFirestore(app);
    storage = getFirebaseStorage(app);
    functions = getFirebaseFunctions(app);
} else {
    app = getApp();
    auth = getFirebaseAuth(app);
    db = getFirebaseFirestore(app);
    storage = getFirebaseStorage(app);
    functions = getFirebaseFunctions(app);
     if (typeof window !== 'undefined') {
      analytics = getAnalytics(app);
       if ("Notification" in window && "serviceWorker" in navigator && "PushManager" in window) {
        messaging = getFirebaseMessaging(app);
      }
    }
}


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

export { app, auth, db, storage, functions, messaging, requestForToken, analytics };
