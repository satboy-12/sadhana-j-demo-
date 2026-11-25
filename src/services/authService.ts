import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/firebase';
import type {
  AuthResponse,
  AuthUser,
  LoginPayload,
  RegisterPayload,
  UserProfile,
} from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { mapFirebaseAuthError } from '../utils/authErrorMapper';
import { wrapFirestoreError } from './firestoreServiceErrors';
import {
  buildInitialPrivateProfileRecord,
  buildInitialUserAccountRecord,
  mapFirestoreDocsToUserProfile,
} from './profileBuilder';

export {
  buildInitialPrivateProfileRecord,
  buildInitialUserAccountRecord,
  mapFirestoreDocsToUserProfile,
};

export function getFirebaseErrorMessage(codeOrMessage: string): string {
  return mapFirebaseAuthError(codeOrMessage, codeOrMessage);
}

const inFlightProfileEnsures = new Map<string, Promise<UserProfile>>();

/**
 * Ensures `/users/{uid}` and `/users/{uid}/private/profile` exist in Cloud Firestore
 * for the verified authenticated user without overwriting existing preferences or PII.
 * Single-flight per UID to avoid concurrent `setDoc` creation races on first sign-in.
 */
export async function ensureUserAccountAndProfile(
  fbUser: FirebaseUser,
  preferredFullName?: string,
): Promise<UserProfile> {
  const existingPromise = inFlightProfileEnsures.get(fbUser.uid);
  if (existingPromise) {
    return existingPromise;
  }

  const run = (async () => {
    const uid = fbUser.uid;
    const userDocPath = `users/${uid}`;
    const privateDocPath = `users/${uid}/private/profile`;
    const userRef = doc(db, 'users', uid);
    const privateRef = doc(db, 'users', uid, 'private', 'profile');

    let accountData: Record<string, unknown>;
    try {
      const accountSnap = await getDoc(userRef);
      if (!accountSnap.exists()) {
        const initialAccount = buildInitialUserAccountRecord(fbUser, preferredFullName);
        await setDoc(userRef, {
          ...initialAccount,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        accountData = initialAccount;
      } else {
        accountData = accountSnap.data() as Record<string, unknown>;
      }
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.WRITE,
        userDocPath,
        'Cloud Firestore · users',
        'POST',
        'Failed to load or initialize your user account.',
      );
    }

    let privateData: Record<string, unknown>;
    try {
      const privateSnap = await getDoc(privateRef);
      if (!privateSnap.exists()) {
        const initialPrivate = buildInitialPrivateProfileRecord(fbUser);
        await setDoc(privateRef, {
          ...initialPrivate,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        privateData = initialPrivate;
      } else {
        privateData = privateSnap.data() as Record<string, unknown>;
      }
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.WRITE,
        privateDocPath,
        'Cloud Firestore · private profile',
        'POST',
        'Failed to load or initialize your private profile.',
      );
    }

    return mapFirestoreDocsToUserProfile(uid, accountData, privateData, fbUser);
  })();

  inFlightProfileEnsures.set(fbUser.uid, run);
  try {
    return await run;
  } finally {
    inFlightProfileEnsures.delete(fbUser.uid);
  }
}

export function mapFirebaseUserToAuthUser(
  fbUser: FirebaseUser,
  profileData?: Partial<UserProfile>,
): AuthUser {
  return {
    id: fbUser.uid,
    fullName:
      profileData?.fullName || fbUser.displayName || fbUser.email?.split('@')[0] || 'Member',
    email: fbUser.email || '',
    memberSince: profileData?.memberSince || new Date().toISOString().slice(0, 10),
    accountTier: profileData?.accountTier || 'Firebase Cloud',
  };
}

export const authService = {
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const { fullName, email, password } = payload;
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    await updateProfile(user, { displayName: fullName.trim() });
    const profile = await ensureUserAccountAndProfile(user, fullName.trim());

    const token = await user.getIdToken();
    const authUser = mapFirebaseUserToAuthUser(user, profile);
    return { token, tokenType: 'Bearer', user: authUser };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    const profile = await ensureUserAccountAndProfile(user);
    const token = await user.getIdToken();
    const authUser = mapFirebaseUserToAuthUser(user, profile);

    return { token, tokenType: 'Bearer', user: authUser };
  },

  async loginWithGoogle(): Promise<AuthResponse> {
    const cred = await signInWithPopup(auth, googleProvider);
    const user = cred.user;
    const profile = await ensureUserAccountAndProfile(user);
    const token = await user.getIdToken();
    const authUser = mapFirebaseUserToAuthUser(user, profile);
    return { token, tokenType: 'Bearer', user: authUser };
  },

  async logout(): Promise<void> {
    await signOut(auth);
  },

  async sendPasswordReset(email: string): Promise<void> {
    await sendPasswordResetEmail(auth, email.trim());
  },

  getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  },

  onAuthChange(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  },

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    const userDocPath = `users/${uid}`;
    const privateDocPath = `users/${uid}/private/profile`;
    try {
      const accountSnap = await getDoc(doc(db, 'users', uid));
      if (!accountSnap.exists()) return null;
      const privateSnap = await getDoc(doc(db, 'users', uid, 'private', 'profile'));
      return mapFirestoreDocsToUserProfile(
        uid,
        accountSnap.data() as Record<string, unknown>,
        privateSnap.exists() ? (privateSnap.data() as Record<string, unknown>) : {},
      );
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.GET,
        privateDocPath || userDocPath,
        'Cloud Firestore · profile',
        'GET',
        'Failed to read user profile.',
      );
    }
  },
};
