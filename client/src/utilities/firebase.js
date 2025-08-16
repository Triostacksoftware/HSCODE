// Import only what we need from Firebase's modular SDK (smaller bundle).
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
// Firebase project configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};
// Avoid initializing the app twice
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
// Get the Auth object
export const auth = getAuth(app);
// Keep the user signed in across refreshes
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(console.error);
  auth.useDeviceLanguage();
}
export default app;
