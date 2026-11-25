import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { WellnessEntry } from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS, normalizeIsoDate, sanitizeBoundedText } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

const VALID_MOODS: WellnessEntry['mood'][] = ['Radiant', 'Calm', 'Fatigued', 'Anxious', 'Low'];
const VALID_SLEEP_QUALITIES: WellnessEntry['sleepQuality'][] = [
  'Restless',
  'Good/Restful',
  'Deep/Healing',
];

function normalizeMood(mood: unknown): WellnessEntry['mood'] {
  return VALID_MOODS.includes(mood as WellnessEntry['mood'])
    ? (mood as WellnessEntry['mood'])
    : 'Calm';
}

function normalizeSleepQuality(q: unknown): WellnessEntry['sleepQuality'] {
  return VALID_SLEEP_QUALITIES.includes(q as WellnessEntry['sleepQuality'])
    ? (q as WellnessEntry['sleepQuality'])
    : 'Good/Restful';
}

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  return typeof val === 'string' ? val : '';
}

export const wellnessService = {
  async list(): Promise<WellnessEntry[]> {
    const user = requireAuthenticatedUser('Cloud Firestore · wellness', 'GET');
    const colPath = `users/${user.uid}/wellness`;
    try {
      const q = query(collection(db, 'users', user.uid, 'wellness'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) return [];

      const records: WellnessEntry[] = snap.docs.map((docSnap) => {
        const item = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          date: String(item.date || ''),
          mood: normalizeMood(item.mood),
          sleepHours: item.sleepHours !== undefined ? Number(item.sleepHours) : 0,
          sleepQuality: normalizeSleepQuality(item.sleepQuality),
          stressLevel: item.stressLevel !== undefined ? Number(item.stressLevel) : 3,
          notes: String(item.notes || ''),
          createdAt: timestampToIso(item.createdAt),
        };
      });

      return records.sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.LIST,
        colPath,
        'Cloud Firestore · wellness',
        'GET',
        'Failed to load wellness logs.',
      );
    }
  },

  async create(payload: Omit<WellnessEntry, 'id'>): Promise<WellnessEntry> {
    const user = requireAuthenticatedUser('Cloud Firestore · wellness', 'POST');
    const colPath = `users/${user.uid}/wellness`;
    try {
      await ensureUserAccountAndProfile(user);
      const date = normalizeIsoDate(payload.date);
      const mood = normalizeMood(payload.mood);
      const sleepHours = Math.max(0, Math.min(24, Number(payload.sleepHours) || 0));
      const sleepQuality = normalizeSleepQuality(payload.sleepQuality);
      const stressLevel = Math.max(1, Math.min(10, Math.round(Number(payload.stressLevel) || 1)));
      const notes = sanitizeBoundedText(payload.notes || '', BLUEPRINT_LIMITS.NOTES_MAX);

      const docRef = await addDoc(collection(db, 'users', user.uid, 'wellness'), {
        userId: user.uid,
        date,
        mood,
        sleepHours,
        sleepQuality,
        stressLevel,
        notes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        date,
        mood,
        sleepHours,
        sleepQuality,
        stressLevel,
        notes,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.CREATE,
        colPath,
        'Cloud Firestore · wellness',
        'POST',
        'Failed to save wellness log.',
      );
    }
  },

  async remove(id: string): Promise<void> {
    const user = requireAuthenticatedUser('Cloud Firestore · wellness', 'DELETE');
    const docPath = `users/${user.uid}/wellness/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'wellness', id));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.DELETE,
        docPath,
        'Cloud Firestore · wellness',
        'DELETE',
        'Failed to delete wellness log.',
      );
    }
  },
};
