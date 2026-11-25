import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../firebase/firebase';
import { ensureUserAccountAndProfile } from '../services/authService';
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/api';
import { mapFirebaseAuthError } from '../utils/authErrorMapper';

export { mapFirebaseAuthError };

interface AuthContextValue {
  user: AuthUser | null;
  authReady: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const IS_DEV = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

const pendingRegistrationNames = new Map<string, string>();

function toAuthUser(fbUser: FirebaseUser, preferredFullName?: string): AuthUser {
  return {
    id: fbUser.uid,
    fullName:
      preferredFullName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
    email: fbUser.email || '',
    accountTier: 'Firebase Cloud',
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const emailKey = (fbUser.email || '').trim().toLowerCase();
        const pendingName = emailKey ? pendingRegistrationNames.get(emailKey) : undefined;
        setUser(toAuthUser(fbUser, pendingName));
        try {
          const profile = await ensureUserAccountAndProfile(fbUser, pendingName);
          if (emailKey && pendingName) {
            pendingRegistrationNames.delete(emailKey);
          }
          setUser({
            id: fbUser.uid,
            fullName: profile.fullName,
            email: profile.email || fbUser.email || '',
            memberSince: profile.memberSince,
            accountTier: profile.accountTier || 'Firebase Cloud',
          });
        } catch (err) {
          if (IS_DEV) {
            console.error('[AuthContext] Failed to ensure Firestore user profile:', err);
          }
        }
      } else {
        setUser(null);
      }
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    try {
      await setPersistence(
        auth,
        payload.rememberMe ? browserLocalPersistence : browserSessionPersistence,
      );
      const cred = await signInWithEmailAndPassword(auth, payload.email.trim(), payload.password);
      setUser(toAuthUser(cred.user));
      try {
        const profile = await ensureUserAccountAndProfile(cred.user);
        setUser({
          id: cred.user.uid,
          fullName: profile.fullName,
          email: profile.email || cred.user.email || '',
          memberSince: profile.memberSince,
          accountTier: profile.accountTier || 'Firebase Cloud',
        });
      } catch (err) {
        if (IS_DEV) {
          console.error('[AuthContext] Profile provisioning deferred to dashboard:', err);
        }
      }
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err, 'Unable to complete sign in.'));
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    try {
      await setPersistence(auth, browserLocalPersistence);
      const cred = await signInWithPopup(auth, googleProvider);
      setUser(toAuthUser(cred.user));
      try {
        const profile = await ensureUserAccountAndProfile(cred.user);
        setUser({
          id: cred.user.uid,
          fullName: profile.fullName,
          email: profile.email || cred.user.email || '',
          memberSince: profile.memberSince,
          accountTier: profile.accountTier || 'Firebase Cloud',
        });
      } catch (err) {
        if (IS_DEV) {
          console.error('[AuthContext] Google sign-in profile provisioning deferred:', err);
        }
      }
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err, 'Unable to sign in with Google.'));
    }
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const cleanName = payload.fullName.trim();
    const cleanEmail = payload.email.trim();
    const emailKey = cleanEmail.toLowerCase();
    pendingRegistrationNames.set(emailKey, cleanName);
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, payload.password);
      await updateProfile(cred.user, { displayName: cleanName });

      let memberSince: string | undefined;
      try {
        const profile = await ensureUserAccountAndProfile(cred.user, cleanName);
        memberSince = profile.memberSince;
      } catch (profileErr) {
        if (IS_DEV) {
          console.error('[AuthContext] Post-register profile init failed:', profileErr);
        }
      }

      setUser({
        id: cred.user.uid,
        fullName: cleanName,
        email: cred.user.email || cleanEmail,
        memberSince,
        accountTier: 'Firebase Cloud',
      });
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err, 'Unable to create account.'));
    } finally {
      pendingRegistrationNames.delete(emailKey);
    }
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err) {
      throw new Error(mapFirebaseAuthError(err, 'Unable to send password reset email.'));
    }
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      authReady,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      register,
      sendPasswordReset,
      logout,
    }),
    [
      user,
      authReady,
      login,
      loginWithGoogle,
      register,
      sendPasswordReset,
      logout,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
