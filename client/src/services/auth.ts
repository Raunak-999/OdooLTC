import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types';

// Utility function to sanitize data for Firestore (remove undefined values)
const sanitizeForFirestore = (obj: any): any => {
  const sanitized: any = {};
  Object.keys(obj).forEach(key => {
    const value = obj[key];
    if (value !== undefined) {
      sanitized[key] = value;
    }
  });
  return sanitized;
};

// Create a new user profile in Firestore
export async function createUserProfile(firebaseUser: any): Promise<User> {
  console.log('🔐 Auth Service: Creating user profile for:', firebaseUser.uid);
  console.log('🔐 Auth Service: Firebase user data:', {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    displayName: firebaseUser.displayName,
    photoURL: firebaseUser.photoURL
  });
  
  const userProfileData = {
    uid: firebaseUser.uid,
    email: firebaseUser.email || '',
    displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
    photoURL: firebaseUser.photoURL || null, // Convert undefined to null
    bio: '',
    reputation: 0,
    questionsAsked: 0,
    answersGiven: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  // Sanitize the data to remove any undefined values
  const sanitizedData = sanitizeForFirestore(userProfileData);
  
  console.log('🔐 Auth Service: Profile data before sanitization:', userProfileData);
  console.log('🔐 Auth Service: Profile data after sanitization:', sanitizedData);
  
  // Verify no undefined values exist
  const hasUndefined = Object.values(sanitizedData).some(value => value === undefined);
  if (hasUndefined) {
    console.error('🔐 Auth Service: Profile data still contains undefined values:', sanitizedData);
    throw new Error('Cannot create profile with undefined values');
  }

  try {
    await setDoc(doc(db, 'users', firebaseUser.uid), sanitizedData);
    console.log('🔐 Auth Service: User profile created successfully:', sanitizedData);
    
    // Return the profile data with proper date conversion
    return {
      ...sanitizedData,
      createdAt: new Date(),
      updatedAt: new Date()
    } as User;
  } catch (error) {
    console.error('🔐 Auth Service: Error creating user profile:', error);
    console.error('🔐 Auth Service: Error details:', {
      code: (error as any).code,
      message: (error as any).message,
      firebaseUser: firebaseUser
    });
    throw error;
  }
}

// Ensure user profile exists, create if missing
export async function ensureUserProfile(userId: string): Promise<User> {
  console.log('🔐 Auth Service: Ensuring user profile exists for:', userId);
  
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (userDoc.exists()) {
      console.log('🔐 Auth Service: User profile already exists');
      const data = userDoc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as User;
    } else {
      console.log('🔐 Auth Service: User profile not found, creating new one');
      // Get current Firebase user to create profile
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      return await createUserProfile(currentUser);
    }
  } catch (error) {
    console.error('🔐 Auth Service: Error ensuring user profile:', error);
    throw error;
  }
}

// Update user profile safely
export async function updateUserProfile(userId: string, updates: Partial<User>): Promise<void> {
  console.log('🔐 Auth Service: Updating user profile for:', userId, updates);
  
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.log('🔐 Auth Service: User profile doesn\'t exist, creating it first');
      await ensureUserProfile(userId);
    }
    
    // Sanitize updates to remove undefined values
    const sanitizedUpdates = sanitizeForFirestore({
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    await updateDoc(userRef, sanitizedUpdates);
    
    console.log('🔐 Auth Service: User profile updated successfully');
  } catch (error) {
    console.error('🔐 Auth Service: Error updating user profile:', error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  console.log('🔐 Auth Service: Login attempt for:', email);
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('🔐 Auth Service: Login successful:', {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      displayName: userCredential.user.displayName
    });
    return userCredential.user;
  } catch (error) {
    console.error('🔐 Auth Service: Login failed:', error);
    throw error;
  }
}

export async function signupUser(email: string, password: string, displayName: string) {
  console.log('🔐 Auth Service: Signup attempt for:', email, displayName);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;
    console.log('🔐 Auth Service: Firebase user created:', {
      uid: firebaseUser.uid,
      email: firebaseUser.email
    });

    // Update the user's display name
    console.log('🔐 Auth Service: Updating display name');
    await updateProfile(firebaseUser, { displayName });
    console.log('🔐 Auth Service: Display name updated successfully');

    // Create user profile in Firestore
    console.log('🔐 Auth Service: Creating user profile in Firestore');
    await createUserProfile(firebaseUser);
    console.log('🔐 Auth Service: User profile created successfully');

    return firebaseUser;
  } catch (error) {
    console.error('🔐 Auth Service: Signup failed:', error);
    throw error;
  }
}

export async function logoutUser() {
  console.log('🔐 Auth Service: Logout attempt');
  try {
    await signOut(auth);
    console.log('🔐 Auth Service: Logout successful');
  } catch (error) {
    console.error('🔐 Auth Service: Logout failed:', error);
    throw error;
  }
}

export async function getUserProfile(uid: string): Promise<User> {
  console.log('🔐 Auth Service: Fetching user profile for:', uid);
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (!userDoc.exists()) {
      console.error('🔐 Auth Service: User profile not found for:', uid);
      throw new Error('User profile not found');
    }
    
    const data = userDoc.data();
    const userProfile = {
      ...data,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as User;
    
    console.log('🔐 Auth Service: User profile loaded successfully:', {
      uid: userProfile.uid,
      email: userProfile.email,
      displayName: userProfile.displayName,
      reputation: userProfile.reputation
    });
    
    return userProfile;
  } catch (error) {
    console.error('🔐 Auth Service: Error fetching user profile:', error);
    throw error;
  }
}
