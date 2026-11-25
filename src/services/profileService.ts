import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteUser, updateProfile } from 'firebase/auth';
import { db } from '../firebase/firebase';
import type { UserProfile } from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS, BLUEPRINT_PATTERNS, sanitizeBoundedText } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

const SUBCOLLECTIONS = ['periods', 'symptoms', 'wellness', 'nutrition', 'water', 'journal'] as const;

export const profileService = {
  async get(): Promise<UserProfile> {
    const user = requireAuthenticatedUser('Cloud Firestore · profile', 'GET');
    const docPath = `users/${user.uid}`;
    try {
      return await ensureUserAccountAndProfile(user);
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.GET,
        docPath,
        'Cloud Firestore · profile',
        'GET',
        'Failed to load your profile.',
      );
    }
  },

  async update(payload: Partial<UserProfile>): Promise<UserProfile> {
    const user = requireAuthenticatedUser('Cloud Firestore · profile', 'PATCH');
    const accountPath = `users/${user.uid}`;
    const privatePath = `users/${user.uid}/private/profile`;

    try {
      await ensureUserAccountAndProfile(user);

      const accountUpdates: Record<string, unknown> = {};
      if (payload.fullName !== undefined && payload.fullName.trim()) {
        const cleanName = sanitizeBoundedText(payload.fullName, BLUEPRINT_LIMITS.FULL_NAME_MAX);
        if (cleanName) {
          accountUpdates.fullName = cleanName;
          await updateProfile(user, { displayName: cleanName }).catch(() => {});
        }
      }
      if (payload.preferences) {
        if (payload.preferences.cycleReminders !== undefined) {
          accountUpdates.cycleReminders = Boolean(payload.preferences.cycleReminders);
        }
        if (payload.preferences.medicationAlerts !== undefined) {
          accountUpdates.medicationAlerts = Boolean(payload.preferences.medicationAlerts);
        }
        if (payload.preferences.hydrationNudges !== undefined) {
          accountUpdates.hydrationNudges = Boolean(payload.preferences.hydrationNudges);
        }
        if (payload.preferences.dailyCalorieTarget !== undefined) {
          accountUpdates.dailyCalorieTarget = Math.max(
            BLUEPRINT_LIMITS.TARGET_MIN,
            Math.min(
              BLUEPRINT_LIMITS.TARGET_MAX,
              Math.round(Number(payload.preferences.dailyCalorieTarget)),
            ),
          );
        }
        if (payload.preferences.dailyWaterTargetMl !== undefined) {
          accountUpdates.dailyWaterTargetMl = Math.max(
            BLUEPRINT_LIMITS.TARGET_MIN,
            Math.min(
              BLUEPRINT_LIMITS.TARGET_MAX,
              Math.round(Number(payload.preferences.dailyWaterTargetMl)),
            ),
          );
        }
      }

      if (Object.keys(accountUpdates).length > 0) {
        accountUpdates.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'users', user.uid), accountUpdates);
      }

      const privateUpdates: Record<string, unknown> = {};
      if (payload.email !== undefined) {
        const cleanEmail = sanitizeBoundedText(payload.email, BLUEPRINT_LIMITS.EMAIL_MAX);
        if (BLUEPRINT_PATTERNS.EMAIL.test(cleanEmail)) {
          privateUpdates.email = cleanEmail;
        }
      }
      if (payload.dateOfBirth !== undefined) {
        const cleanDob = sanitizeBoundedText(payload.dateOfBirth, BLUEPRINT_LIMITS.DATE_LEN);
        if (cleanDob === '' || BLUEPRINT_PATTERNS.ISO_DATE.test(cleanDob)) {
          privateUpdates.dateOfBirth = cleanDob;
        }
      }
      if (payload.phoneNumber !== undefined) {
        privateUpdates.phoneNumber = sanitizeBoundedText(
          payload.phoneNumber,
          BLUEPRINT_LIMITS.PHONE_MAX,
        );
      }

      if (Object.keys(privateUpdates).length > 0) {
        privateUpdates.updatedAt = serverTimestamp();
        try {
          await updateDoc(doc(db, 'users', user.uid, 'private', 'profile'), privateUpdates);
        } catch (privErr) {
          wrapFirestoreError(
            privErr,
            OperationType.UPDATE,
            privatePath,
            'Cloud Firestore · private profile',
            'PATCH',
            'Failed to update private profile details.',
          );
        }
      }

      return this.get();
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.UPDATE,
        accountPath,
        'Cloud Firestore · profile',
        'PATCH',
        'Failed to save profile changes.',
      );
    }
  },

  async deleteAccount(): Promise<void> {
    const user = requireAuthenticatedUser('Cloud Firestore · profile', 'DELETE');
    const accountPath = `users/${user.uid}`;
    try {
      for (const sub of SUBCOLLECTIONS) {
        const snap = await getDocs(
          query(collection(db, 'users', user.uid, sub), where('userId', '==', user.uid)),
        );
        await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      }
      await deleteDoc(doc(db, 'users', user.uid, 'private', 'profile'));
      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.DELETE,
        accountPath,
        'Cloud Firestore · profile',
        'DELETE',
        'Failed to delete account.',
      );
    }
  },
};
