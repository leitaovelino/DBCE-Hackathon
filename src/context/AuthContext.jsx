import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setUserProfile(docSnap.data());
          } else {
            // Default tourist profile if doc does not yet exist
            const fallbackProfile = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'Traveler',
              email: firebaseUser.email,
              role: 'tourist'
            };
            setUserProfile(fallbackProfile);
          }
        } catch (error) {
          console.error('Error loading Firestore user profile:', error);
          setUserProfile({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'Traveler',
            email: firebaseUser.email,
            role: 'tourist'
          });
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register with Email & Password
  const register = async (name, email, password, role = 'tourist') => {
    // Security: Only allow public registration for 'tourist' or 'business_owner'
    // 'authority' role is strictly prohibited from self-registration
    const assignedRole = role === 'business_owner' ? 'business_owner' : 'tourist';

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Set displayName on Firebase Auth
    await updateProfile(user, { displayName: name });

    // Create corresponding Firestore document at users/{uid}
    const userDocRef = doc(db, 'users', user.uid);
    const profileData = {
      uid: user.uid,
      name: name,
      email: email,
      role: assignedRole,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    await setDoc(userDocRef, profileData);

    setUserProfile({
      ...profileData,
      createdAt: new Date()
    });

    return { user, profile: profileData };
  };

  // Login with Email & Password
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch user role & profile
    const userDocRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(userDocRef);

    let profile = null;
    if (docSnap.exists()) {
      profile = docSnap.data();
      setUserProfile(profile);
    } else {
      profile = {
        uid: user.uid,
        name: user.displayName || 'Traveler',
        email: user.email,
        role: 'tourist'
      };
      setUserProfile(profile);
    }

    return { user, profile };
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Password Reset
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update Display Name (Role cannot be modified from profile)
  const updateUserName = async (newName) => {
    if (!auth.currentUser) return;
    await updateProfile(auth.currentUser, { displayName: newName });
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, {
      name: newName,
      updatedAt: serverTimestamp()
    });
    setUserProfile((prev) => (prev ? { ...prev, name: newName } : null));
  };

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || 'guest',
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateUserName
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
