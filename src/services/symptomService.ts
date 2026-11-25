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
import type { PcosSymptomLog } from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS, sanitizeBoundedText, sanitizeSymptomList } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

function timestampToIso(val: unknown): string {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  return typeof val === 'string' ? val : '';
}

export const symptomsService = {
  async list(): Promise<PcosSymptomLog[]> {
    const user = requireAuthenticatedUser('Cloud Firestore · symptoms', 'GET');
    const colPath = `users/${user.uid}/symptoms`;
    try {
      const q = query(collection(db, 'users', user.uid, 'symptoms'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) return [];

      const records: PcosSymptomLog[] = snap.docs.map((docSnap) => {
        const item = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          date: String(item.date || ''),
          symptoms: Array.isArray(item.symptoms) ? item.symptoms.map(String) : [],
          severity: Number(item.severity) || 1,
          painLevel: Number(item.painLevel) || 0,
          energyLevel: Number(item.energyLevel) || 3,
          observations: String(item.observations || ''),
          createdAt: timestampToIso(item.createdAt),
        };
      });

      return records.sort((a, b) => b.date.localeCompare(a.date));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.LIST,
        colPath,
        'Cloud Firestore · symptoms',
        'GET',
        'Failed to load symptom logs.',
      );
    }
  },

  async create(payload: Omit<PcosSymptomLog, 'id'>): Promise<PcosSymptomLog> {
    const user = requireAuthenticatedUser('Cloud Firestore · symptoms', 'POST');
    const colPath = `users/${user.uid}/symptoms`;
    try {
      await ensureUserAccountAndProfile(user);
      const cleanSymptoms = sanitizeSymptomList(payload.symptoms);
      const severity = Math.max(1, Math.min(5, Math.round(Number(payload.severity) || 1)));
      const painLevel = Math.max(0, Math.min(10, Math.round(Number(payload.painLevel ?? 0))));
      const energyLevel = Math.max(1, Math.min(5, Math.round(Number(payload.energyLevel ?? 3))));
      const observations = sanitizeBoundedText(payload.observations || '', BLUEPRINT_LIMITS.NOTES_MAX);

      const docRef = await addDoc(collection(db, 'users', user.uid, 'symptoms'), {
        userId: user.uid,
        date: payload.date,
        symptoms: cleanSymptoms,
        severity,
        painLevel,
        energyLevel,
        observations,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        date: payload.date,
        symptoms: cleanSymptoms,
        severity,
        painLevel,
        energyLevel,
        observations,
        createdAt: new Date().toISOString(),
      };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.CREATE,
        colPath,
        'Cloud Firestore · symptoms',
        'POST',
        'Failed to save symptom log.',
      );
    }
  },

  async remove(id: string): Promise<void> {
    const user = requireAuthenticatedUser('Cloud Firestore · symptoms', 'DELETE');
    const docPath = `users/${user.uid}/symptoms/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'symptoms', id));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.DELETE,
        docPath,
        'Cloud Firestore · symptoms',
        'DELETE',
        'Failed to delete symptom log.',
      );
    }
  },
};
