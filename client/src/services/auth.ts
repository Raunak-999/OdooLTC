import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

export async function loginUser(email: string, password: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function signupUser(email: string, password: string, displayName: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;

  // Update the user's display name
  await updateProfile(firebaseUser, { displayName });

  // Create user profile in Firestore
  const userData: Omit<User, 'createdAt' | 'updatedAt'> = {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    displayName,
    photoURL: firebaseUser.photoURL || undefined,
    bio: '',
    reputation: 0,
    questionsAsked: 0,
    answersGiven: 0,
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userData,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return firebaseUser;
}

export async function logoutUser() {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<User> {
  const userDoc = await getDoc(doc(db, 'users', uid));
  if (!userDoc.exists()) {
    throw new Error('User profile not found');
  }
  
  const data = userDoc.data();
  return {
    ...data,
    createdAt: data.createdAt?.toDate() || new Date(),
    updatedAt: data.updatedAt?.toDate() || new Date(),
  } as User;
}
