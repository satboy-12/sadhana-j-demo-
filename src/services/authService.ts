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
  if (codeOrMessage.includes('auth/email-already-in-use')) {
    return 'This email address is already registered. Please sign in instead.';
  }
  if (codeOrMessage.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }
  if (codeOrMessage.includes('auth/weak-password')) {
    return 'Password is too weak. Please use at least 8 characters with letters and numbers.';
  }
  if (
    codeOrMessage.includes('auth/wrong-password') ||
    codeOrMessage.includes('auth/invalid-credential')
  ) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }
  if (codeOrMessage.includes('auth/user-not-found')) {
    return 'No account exists with this email address. Please register first.';
  }
  if (codeOrMessage.includes('auth/too-many-requests')) {
    return 'Too many unsuccessful attempts. Access temporarily blocked for security. Please try again later or reset password.';
  }
  if (codeOrMessage.includes('auth/popup-closed-by-user')) {
    return 'Google sign-in popup was closed before completing authentication.';
  }
  if (codeOrMessage.includes('auth/popup-blocked')) {
    return 'Popup was blocked by your browser. Please allow popups for this site and try again.';
  }
  if (codeOrMessage.includes('auth/unauthorized-domain')) {
    return 'This domain is not yet authorized in Firebase Console (Authentication → Settings → Authorized domains).';
  }
  if (codeOrMessage.includes('auth/operation-not-allowed')) {
    return 'This sign-in provider is not yet enabled in Firebase Console (Authentication → Sign-in method).';
  }
  if (codeOrMessage.includes('auth/network-request-failed')) {
    return 'Network connection error. Please verify your internet connection.';
  }
  return codeOrMessage;
}

/**
 * Ensures `/users/{uid}` and `/users/{uid}/private/profile` exist in Cloud Firestore
 * for the verified authenticated user without overwriting existing preferences or PII.
 */
export async function ensureUserAccountAndProfile(
  fbUser: FirebaseUser,
  preferredFullName?: string,
): Promise<UserProfile> {
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
    let profile: UserProfile | undefined;
    if (user.emailVerified) {
      profile = await ensureUserAccountAndProfile(user, fullName.trim());
    }

    const token = await user.getIdToken();
    const authUser = mapFirebaseUserToAuthUser(user, profile);
    return { token, tokenType: 'Bearer', user: authUser };
  },

  async login(payload: LoginPayload): Promise<AuthResponse> {
    const { email, password } = payload;
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    const user = cred.user;

    let profile: UserProfile | undefined;
    if (user.emailVerified) {
      profile = await ensureUserAccountAndProfile(user);
    }
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
