'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { 
  signInWithPopup,
  GoogleAuthProvider,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
  linkWithCredential,
  unlink,
  type User,
  type AuthError,
  PhoneAuthCredential,
} from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { UserRole } from '@/types/enums';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  logOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendMagicLink: (email: string) => Promise<void>;
  handleMagicLinkSignIn: () => Promise<void>;
  deleteRequest: (requestId: string) => Promise<void>;
  linkPhoneNumber: (phoneCredential: PhoneAuthCredential) => Promise<void>;
  unlinkProvider: (providerId: string) => Promise<void>;
  getLinkedProviders: () => string[];
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user in Firestore
  const updateUserData = async (user: User, role = UserRole.MEMBER) => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // Create new user document
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          role: role,
          createdAt: serverTimestamp()
        });
      }
      
      // Set role in state
      setUserRole(role as UserRole);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const authStateChanged = async (currentUser: User | null) => {
      console.log('Auth state changed:', currentUser?.email);
      setUser(currentUser);
      
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const roleFromDb = userDoc.data().role;
            console.log('User role from DB:', roleFromDb);
            
            // Direct string comparison instead of enum mapping
            setUserRole(roleFromDb === 'admin' ? UserRole.ADMIN : UserRole.MEMBER);
            console.log('Set user role to:', roleFromDb);
          } else {
            setUserRole(null);
            console.log('No user document found');
          }
        } catch (e) {
          console.error('Error fetching user role:', e);
          setUserRole(null);
        }
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    };

    unsubscribe = auth.onAuthStateChanged(authStateChanged);
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign in successful:', result.user.uid);
      
      // Fetch user doc immediately after sign in
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        const roleFromDb = userDoc.data().role;
        console.log('Existing user role:', roleFromDb);
        setUserRole(roleFromDb === 'admin' ? UserRole.ADMIN : UserRole.MEMBER);
      } else {
        // Create new user document with default role
        await updateUserData(result.user);
      }
    } catch (error) {
      console.error('Google Sign-in Error:', error);
      throw error;
    }
  };

  const sendMagicLink = async (email: string) => {
    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/auth/verify`,
        handleCodeInApp: true
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      localStorage.setItem('emailForSignIn', email);
    } catch (error) {
      console.error('Magic Link Error:', error);
      const authError = error as AuthError;
      switch (authError.code) {
        case 'auth/invalid-email':
          throw new Error('Invalid email address');
        case 'auth/missing-android-pkg-name':
          throw new Error('Configuration error. Please contact support.');
        default:
          throw new Error('Failed to send login link');
      }
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!isSignInWithEmailLink(auth, window.location.href)) return;

    const email = localStorage.getItem('emailForSignIn');
    if (!email) throw new Error('Email not found');

    const result = await signInWithEmailLink(auth, email, window.location.href);
    localStorage.removeItem('emailForSignIn');
    await updateUserData(result.user);
  };

  const deleteRequest = async (requestId: string) => {
    if (!user || userRole !== UserRole.ADMIN) {
      throw new Error('Unauthorized');
    }
    await deleteDoc(doc(db, 'demoRequests', requestId));
  };
  const linkPhoneNumber = async (phoneCredential: PhoneAuthCredential) => {
    if (!auth.currentUser) throw new Error('No user signed in');
    try {
      await linkWithCredential(auth.currentUser, phoneCredential);
    } catch (error) {
      console.error('Error linking phone number:', error);
      throw error;
    }
  };

  const unlinkProvider = async (providerId: string) => {
    if (!auth.currentUser) throw new Error('No user signed in');
    try {
      await unlink(auth.currentUser, providerId);
    } catch (error) {
      console.error('Error unlinking provider:', error);
      throw error;
    }
  };

  const getLinkedProviders = () => {
    try {
      const currentUser = auth?.currentUser;
      if (!currentUser) return [];
      return currentUser.providerData.map(provider => provider.providerId);
    } catch (error) {
      console.error('Error getting linked providers:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userRole, 
      logOut: async () => await auth.signOut(),
      loading, 
      signInWithGoogle, 
      sendMagicLink,
      handleMagicLinkSignIn,
      deleteRequest,
      linkPhoneNumber,
      unlinkProvider,
      getLinkedProviders,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
