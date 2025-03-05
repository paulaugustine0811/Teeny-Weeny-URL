
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC5uYuX3LZUVv_-kJwYDYh9Jd_bLC3Vc90",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "teenyweenyurl.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "teenyweenyurl",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "teenyweenyurl.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "248195963616",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:248195963616:web:7c2e809eca8c4e44359aa2",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-RYZXBE3Q4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

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
