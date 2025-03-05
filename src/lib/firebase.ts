
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC5uYuX3LZUVv_-kJwYDYh9Jd_bLC3Vc90",
  authDomain: "teenyweenyurl.firebaseapp.com",
  projectId: "teenyweenyurl",
  storageBucket: "teenyweenyurl.appspot.com",
  messagingSenderId: "248195963616",
  appId: "1:248195963616:web:7c2e809eca8c4e44359aa2",
  measurementId: "G-RYZXBE3Q4L"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
