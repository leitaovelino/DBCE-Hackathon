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
  const [hasAuthorityClaim, setHasAuthorityClaim] = useState(false);
  const [loading, setLoading] = useState(true);

  // Helper to resolve verified role and profile
  const resolveProfileAndClaims = async (firebaseUser, forceRefresh = false) => {
    if (!firebaseUser) {
      return { profile: null, role: 'guest', hasAuthority: false };
    }

    // 1. Verify Authority via Firebase ID Token Custom Claims (cryptographically signed)
    let tokenHasAuthority = false;
    try {
      const idTokenResult = await firebaseUser.getIdTokenResult(forceRefresh);
      tokenHasAuthority = idTokenResult.claims && idTokenResult.claims.role === 'authority';
    } catch (e) {
      console.warn('Could not inspect Firebase ID token claims:', e);
    }

    // 2. Load Firestore Profile Document
    let profile = null;
    try {
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        profile = docSnap.data();
      } else {
        profile = {
          uid: firebaseUser.uid,
          name: firebaseUser.displayName || 'Traveler',
          email: firebaseUser.email,
          role: tokenHasAuthority ? 'authority' : 'tourist'
        };
      }
    } catch (error) {
      console.error('Error fetching Firestore profile:', error);
      profile = {
        uid: firebaseUser.uid,
        name: firebaseUser.displayName || 'Traveler',
        email: firebaseUser.email,
        role: tokenHasAuthority ? 'authority' : 'tourist'
      };
    }

    // 3. Security Authority Policy:
    // If the Firestore profile claims 'authority' but the JWT ID token lacks the custom claim,
    // the system refuses to grant authority privileges and downgrades to 'tourist'.
    let effectiveRole = profile.role || 'tourist';
    if (effectiveRole === 'authority' && !tokenHasAuthority) {
      console.warn(
        'Security Alert: Firestore document marked as authority, but Firebase Auth ID Token lacks verified custom claim. Access downgraded to tourist.'
      );
      effectiveRole = 'tourist';
    } else if (tokenHasAuthority) {
      effectiveRole = 'authority';
    }

    const finalProfile = { ...profile, role: effectiveRole };
    return {
      profile: finalProfile,
      role: effectiveRole,
      hasAuthority: tokenHasAuthority
    };
  };

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setCurrentUser(firebaseUser);
      if (firebaseUser) {
        const { profile, hasAuthority } = await resolveProfileAndClaims(firebaseUser);
        setUserProfile(profile);
        setHasAuthorityClaim(hasAuthority);
      } else {
        setUserProfile(null);
        setHasAuthorityClaim(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Force-refresh ID token claims (useful immediately after admin assigns claim)
  const refreshAuthorityToken = async () => {
    if (!auth.currentUser) return false;
    try {
      const { profile, hasAuthority } = await resolveProfileAndClaims(auth.currentUser, true);
      setUserProfile(profile);
      setHasAuthorityClaim(hasAuthority);
      return hasAuthority;
    } catch (err) {
      console.error('Error refreshing token claims:', err);
      return false;
    }
  };

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
    setHasAuthorityClaim(false);

    return { user, profile: profileData };
  };

  // Login with Email & Password
  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const { profile, hasAuthority } = await resolveProfileAndClaims(user, true);
    setUserProfile(profile);
    setHasAuthorityClaim(hasAuthority);

    return { user, profile };
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setUserProfile(null);
    setHasAuthorityClaim(false);
  };

  // Password Reset
  const resetPassword = async (email) => {
    await sendPasswordResetEmail(auth, email);
  };

  // Update Profile Information (Only non-sensitive fields)
  const updateUserProfile = async ({ name, phone, bio }) => {
    if (!auth.currentUser) return;
    const updates = { updatedAt: serverTimestamp() };
    if (name !== undefined) {
      updates.name = name;
      await updateProfile(auth.currentUser, { displayName: name });
    }
    if (phone !== undefined) updates.phone = phone;
    if (bio !== undefined) updates.bio = bio;

    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    await updateDoc(userDocRef, updates);
    setUserProfile((prev) => (prev ? { ...prev, ...updates } : null));
  };

  // Alias for backward compatibility
  const updateUserName = async (newName) => {
    return updateUserProfile({ name: newName });
  };

  const value = {
    currentUser,
    userProfile,
    role: userProfile?.role || 'guest',
    hasAuthorityClaim,
    loading,
    register,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    updateUserName,
    refreshAuthorityToken
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
