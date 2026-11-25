import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { PeriodRecord } from '../types/api';
import { calculateCycleLengths } from '../utils/healthCalculations';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS, sanitizeBoundedText, sanitizeSymptomList } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

const VALID_FLOWS: PeriodRecord['flowIntensity'][] = ['Spotting', 'Light', 'Moderate', 'Heavy'];

function normalizeFlow(flow: unknown): PeriodRecord['flowIntensity'] {
  return VALID_FLOWS.includes(flow as PeriodRecord['flowIntensity'])
    ? (flow as PeriodRecord['flowIntensity'])
    : 'Moderate';
}

export const periodsService = {
  async list(): Promise<PeriodRecord[]> {
    const user = requireAuthenticatedUser('Cloud Firestore · periods', 'GET');
    const colPath = `users/${user.uid}/periods`;
    try {
      const q = query(collection(db, 'users', user.uid, 'periods'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) return [];

      const rawRecords: PeriodRecord[] = snap.docs.map((docSnap) => {
        const item = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          startDate: String(item.startDate || ''),
          endDate: String(item.endDate || ''),
          flowIntensity: normalizeFlow(item.flowIntensity),
          symptoms: Array.isArray(item.symptoms) ? item.symptoms.map(String) : [],
          notes: item.notes ? String(item.notes) : '',
        };
      });

      const sortedAsc = [...rawRecords].sort((a, b) => a.startDate.localeCompare(b.startDate));
      const computedLengths = calculateCycleLengths(sortedAsc);
      const lengthMap = new Map<string, number>();
      for (let i = 1; i < sortedAsc.length; i += 1) {
        if (computedLengths[i - 1] != null) {
          lengthMap.set(sortedAsc[i].id, computedLengths[i - 1]);
        }
      }

      return rawRecords
        .map((record) => ({
          ...record,
          cycleLengthDays: lengthMap.get(record.id),
        }))
        .sort((a, b) => b.startDate.localeCompare(a.startDate));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.LIST,
        colPath,
        'Cloud Firestore · periods',
        'GET',
        'Failed to load period logs.',
      );
    }
  },

  async create(payload: Omit<PeriodRecord, 'id'>): Promise<PeriodRecord> {
    const user = requireAuthenticatedUser('Cloud Firestore · periods', 'POST');
    const colPath = `users/${user.uid}/periods`;
    try {
      await ensureUserAccountAndProfile(user);
      const cleanSymptoms = sanitizeSymptomList(payload.symptoms);
      const cleanNotes = sanitizeBoundedText(payload.notes || '', BLUEPRINT_LIMITS.NOTES_MAX);
      const flowIntensity = normalizeFlow(payload.flowIntensity);

      const docRef = await addDoc(collection(db, 'users', user.uid, 'periods'), {
        userId: user.uid,
        startDate: payload.startDate,
        endDate: payload.endDate,
        flowIntensity,
        symptoms: cleanSymptoms,
        notes: cleanNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return {
        id: docRef.id,
        startDate: payload.startDate,
        endDate: payload.endDate,
        flowIntensity,
        symptoms: cleanSymptoms,
        notes: cleanNotes,
      };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.CREATE,
        colPath,
        'Cloud Firestore · periods',
        'POST',
        'Failed to save period log.',
      );
    }
  },

  async update(id: string, payload: Omit<PeriodRecord, 'id'>): Promise<PeriodRecord> {
    const user = requireAuthenticatedUser('Cloud Firestore · periods', 'PATCH');
    const docPath = `users/${user.uid}/periods/${id}`;
    try {
      const cleanSymptoms = sanitizeSymptomList(payload.symptoms);
      const cleanNotes = sanitizeBoundedText(payload.notes || '', BLUEPRINT_LIMITS.NOTES_MAX);
      const flowIntensity = normalizeFlow(payload.flowIntensity);

      await updateDoc(doc(db, 'users', user.uid, 'periods', id), {
        startDate: payload.startDate,
        endDate: payload.endDate,
        flowIntensity,
        symptoms: cleanSymptoms,
        notes: cleanNotes,
        updatedAt: serverTimestamp(),
      });

      return {
        id,
        startDate: payload.startDate,
        endDate: payload.endDate,
        flowIntensity,
        symptoms: cleanSymptoms,
        notes: cleanNotes,
      };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.UPDATE,
        docPath,
        'Cloud Firestore · periods',
        'PATCH',
        'Failed to update period log.',
      );
    }
  },

  async remove(id: string): Promise<void> {
    const user = requireAuthenticatedUser('Cloud Firestore · periods', 'DELETE');
    const docPath = `users/${user.uid}/periods/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'periods', id));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.DELETE,
        docPath,
        'Cloud Firestore · periods',
        'DELETE',
        'Failed to delete period log.',
      );
    }
  },
};
