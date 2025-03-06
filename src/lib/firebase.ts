
import { initializeApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
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
console.log("Initializing Firebase with config:", {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  databaseURL: firebaseConfig.databaseURL
});

let db;
let analytics = null;

try {
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  console.log("Firebase and Firestore initialized successfully");

  // Only initialize analytics if in a browser environment
  if (typeof window !== 'undefined') {
    try {
      analytics = getAnalytics(app);
      console.log("Firebase Analytics initialized successfully");
    } catch (error) {
      console.warn("Firebase Analytics could not be initialized:", error);
    }
  }

  // Enable offline persistence (for better user experience when offline)
  // This is optional but recommended for URL shortener applications
  if (typeof window !== 'undefined') {
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
  }
} catch (error) {
  console.error("Failed to initialize Firebase:", error);
  // Fallback initialization for error recovery
  try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    console.log("Firebase fallback initialization completed");
  } catch (fallbackError) {
    console.error("Even fallback Firebase initialization failed:", fallbackError);
  }
}

// Export the initialized services
export { db, analytics };
