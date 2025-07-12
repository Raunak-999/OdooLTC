// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log('🔥 Firebase: Configuration loaded:', {
  hasApiKey: !!firebaseConfig.apiKey,
  hasAuthDomain: !!firebaseConfig.authDomain,
  hasProjectId: !!firebaseConfig.projectId,
  hasStorageBucket: !!firebaseConfig.storageBucket,
  hasMessagingSenderId: !!firebaseConfig.messagingSenderId,
  hasAppId: !!firebaseConfig.appId,
  hasMeasurementId: !!firebaseConfig.measurementId,
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Validate configuration
const missingConfig = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingConfig.length > 0) {
  console.error('🔥 Firebase: Missing configuration:', missingConfig);
  console.error('🔥 Firebase: Please check your .env.local file and ensure all Firebase variables are set');
  throw new Error(`Missing Firebase configuration: ${missingConfig.join(', ')}`);
}

// Check for placeholder values
const placeholderValues = Object.entries(firebaseConfig)
  .filter(([key, value]) => value && value.includes('your_'))
  .map(([key]) => key);

if (placeholderValues.length > 0) {
  console.error('🔥 Firebase: Found placeholder values:', placeholderValues);
  console.error('🔥 Firebase: Please replace placeholder values with actual Firebase credentials');
  throw new Error(`Firebase configuration contains placeholder values: ${placeholderValues.join(', ')}`);
}

// Initialize Firebase
console.log('🔥 Firebase: Initializing Firebase app');
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('🔥 Firebase: Firebase app initialized successfully');
} catch (error) {
  console.error('🔥 Firebase: Failed to initialize Firebase app:', error);
  throw error;
}

// Initialize Firebase Analytics (only in browser environment)
let analytics;
if (typeof window !== 'undefined') {
  try {
    console.log('🔥 Firebase: Initializing Analytics');
    analytics = getAnalytics(app);
    console.log('🔥 Firebase: Analytics initialized successfully');
  } catch (error) {
    console.warn('🔥 Firebase: Analytics initialization failed:', error);
    analytics = null;
  }
}

// Initialize Firebase Authentication and get a reference to the service
console.log('🔥 Firebase: Initializing Authentication');
export const auth = getAuth(app);
console.log('🔥 Firebase: Authentication initialized:', {
  currentUser: auth.currentUser,
  authDomain: firebaseConfig.authDomain
});

// Initialize Cloud Firestore and get a reference to the service
console.log('🔥 Firebase: Initializing Firestore');
export const db = getFirestore(app);



console.log('🔥 Firebase: Firestore initialized successfully');

export { analytics };
export default app;
