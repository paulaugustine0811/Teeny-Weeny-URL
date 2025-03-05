
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAQwXn42JPGQgFVHBN1OtxoMZRz5LYyiLY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teeny-weeny-url.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://teeny-weeny-url-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teeny-weeny-url",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teeny-weeny-url.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "230726362026",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:230726362026:web:e26e81d3a361a6790b41d3",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DM264PCKT9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// Enable offline persistence (for better user experience when offline)
// This is optional but recommended for URL shortener applications
try {
  // This will enable the offline persistence feature
  import('firebase/firestore').then(({ enableIndexedDbPersistence }) => {
    enableIndexedDbPersistence(db)
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          // Multiple tabs open, persistence can only be enabled in one tab at a time
          console.warn('Firestore persistence failed: Multiple tabs open');
        } else if (err.code === 'unimplemented') {
          // The current browser does not support all of the
          // features required to enable persistence
          console.warn('Firestore persistence is not available in this browser');
        }
      });
  });
} catch (error) {
  console.warn('Offline persistence could not be enabled:', error);
}
