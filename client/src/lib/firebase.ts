import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDnfD3C5jwyzZ3YslFBYFXYKnePvug5m6s",
  authDomain: "stackit-adc0b.firebaseapp.com",
  projectId: "stackit-adc0b",
  storageBucket: "stackit-adc0b.firebasestorage.app",
  messagingSenderId: "116297476119",
  appId: "1:116297476119:web:bf33516fd9ee11008a1452",
  measurementId: "G-0W9H0VVS38"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
