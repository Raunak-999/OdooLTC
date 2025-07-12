import { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';
import { getUserProfile, loginUser, signupUser, logoutUser, ensureUserProfile } from '@/services/auth';

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔐 AuthProvider: Setting up auth state listener');
    
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      console.log('🔐 AuthProvider: Firebase auth state changed:', {
        hasUser: !!firebaseUser,
        uid: firebaseUser?.uid,
        email: firebaseUser?.email,
        displayName: firebaseUser?.displayName
      });
      
      try {
        setLoading(true);
        setError(null);
        
        if (firebaseUser) {
          try {
            console.log('🔐 AuthProvider: Ensuring user profile exists for:', firebaseUser.uid);
            // Use ensureUserProfile to create profile if it doesn't exist
            const userProfile = await ensureUserProfile(firebaseUser.uid);
            console.log('🔐 AuthProvider: User profile ensured:', userProfile);
            setUser(userProfile);
          } catch (error) {
            console.error('🔐 AuthProvider: Error ensuring user profile:', error);
            
            // Create a fallback user object from Firebase user data (no undefined values)
            const fallbackUser: User = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              photoURL: firebaseUser.photoURL || null, // Convert undefined to null
              bio: '',
              reputation: 0,
              questionsAsked: 0,
              answersGiven: 0,
              createdAt: new Date(),
              updatedAt: new Date(),
            };
            
            console.log('🔐 AuthProvider: Using fallback user data:', fallbackUser);
            setUser(fallbackUser);
            setError('Profile data incomplete, but you are signed in');
          }
        } else {
          console.log('🔐 AuthProvider: No Firebase user, setting user to null');
          setUser(null);
        }
      } catch (error) {
        console.error('🔐 AuthProvider: Auth state change error:', error);
        setError('Authentication error occurred');
        setUser(null);
      } finally {
        setLoading(false);
        console.log('🔐 AuthProvider: Auth state update complete. Current state:', {
          user: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null,
          loading: false,
          error
        });
      }
    });

    return () => {
      console.log('🔐 AuthProvider: Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('🔐 AuthProvider: Login attempt for:', email);
    try {
      setLoading(true);
      setError(null);
      await loginUser(email, password);
      console.log('🔐 AuthProvider: Login successful, waiting for auth state change');
      // The onAuthStateChanged listener will handle updating the user state
    } catch (error: any) {
      console.error('🔐 AuthProvider: Login failed:', error);
      setError(error.message || 'Login failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, displayName: string) => {
    console.log('🔐 AuthProvider: Signup attempt for:', email, displayName);
    try {
      setLoading(true);
      setError(null);
      await signupUser(email, password, displayName);
      console.log('🔐 AuthProvider: Signup successful, waiting for auth state change');
      // The onAuthStateChanged listener will handle updating the user state
    } catch (error: any) {
      console.error('🔐 AuthProvider: Signup failed:', error);
      setError(error.message || 'Signup failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('🔐 AuthProvider: Logout attempt');
    try {
      setLoading(true);
      setError(null);
      await logoutUser();
      console.log('🔐 AuthProvider: Logout successful, user state will be cleared by listener');
      // The onAuthStateChanged listener will handle clearing the user state
    } catch (error: any) {
      console.error('🔐 AuthProvider: Logout failed:', error);
      setError(error.message || 'Logout failed');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  console.log('🔐 AuthProvider: Rendering with state:', {
    hasUser: !!user,
    loading,
    error,
    userDetails: user ? { uid: user.uid, email: user.email, displayName: user.displayName } : null
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
