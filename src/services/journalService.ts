import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { JournalCategory, JournalEntry } from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS, normalizeIsoDateTime, sanitizeBoundedText } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

const VALID_CATEGORIES: JournalCategory[] = [
  'General Reflection',
  'PCOS Symptom Log',
  'Cycle Tracking',
  'Nutrition & Diet',
  'Mental Wellness',
];

function normalizeCategory(category: unknown): JournalCategory {
  return VALID_CATEGORIES.includes(category as JournalCategory)
    ? (category as JournalCategory)
    : 'General Reflection';
}

function timestampToIso(val: unknown): string | undefined {
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  return typeof val === 'string' ? val : undefined;
}

export const journalService = {
  async list(searchQuery?: string): Promise<JournalEntry[]> {
    const user = requireAuthenticatedUser('Cloud Firestore · journal', 'GET');
    const colPath = `users/${user.uid}/journal`;
    try {
      const q = query(collection(db, 'users', user.uid, 'journal'), where('userId', '==', user.uid));
      const snap = await getDocs(q);
      if (snap.empty) return [];

      const records: JournalEntry[] = snap.docs.map((docSnap) => {
        const item = docSnap.data() as Record<string, unknown>;
        return {
          id: docSnap.id,
          title: String(item.title || 'Untitled Entry'),
          content: String(item.content || ''),
          category: normalizeCategory(item.category),
          entryDate: String(item.entryDate || timestampToIso(item.createdAt) || new Date().toISOString()),
          updatedAt: timestampToIso(item.updatedAt) || timestampToIso(item.createdAt),
        };
      });

      const sorted = records.sort((a, b) => b.entryDate.localeCompare(a.entryDate));
      if (!searchQuery?.trim()) return sorted;

      const qText = searchQuery.trim().toLowerCase();
      return sorted.filter(
        (item) =>
          item.title.toLowerCase().includes(qText) ||
          item.content.toLowerCase().includes(qText) ||
          item.category.toLowerCase().includes(qText),
      );
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.LIST,
        colPath,
        'Cloud Firestore · journal',
        'GET',
        'Failed to load journal entries.',
      );
    }
  },

  async create(payload: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const user = requireAuthenticatedUser('Cloud Firestore · journal', 'POST');
    const colPath = `users/${user.uid}/journal`;
    try {
      await ensureUserAccountAndProfile(user);
      const nowIso = new Date().toISOString();
      const entryDate = normalizeIsoDateTime(payload.entryDate, nowIso);
      const title =
        sanitizeBoundedText(payload.title, BLUEPRINT_LIMITS.TITLE_MAX) || 'Untitled Entry';
      const content = sanitizeBoundedText(payload.content, BLUEPRINT_LIMITS.CONTENT_MAX);
      const category = normalizeCategory(payload.category);

      const docRef = await addDoc(collection(db, 'users', user.uid, 'journal'), {
        userId: user.uid,
        title,
        content,
        category,
        entryDate,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      return { id: docRef.id, title, content, category, entryDate, updatedAt: nowIso };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.CREATE,
        colPath,
        'Cloud Firestore · journal',
        'POST',
        'Failed to create journal entry.',
      );
    }
  },

  async update(id: string, payload: Omit<JournalEntry, 'id'>): Promise<JournalEntry> {
    const user = requireAuthenticatedUser('Cloud Firestore · journal', 'PATCH');
    const docPath = `users/${user.uid}/journal/${id}`;
    try {
      const nowIso = new Date().toISOString();
      const entryDate = normalizeIsoDateTime(payload.entryDate, nowIso);
      const title =
        sanitizeBoundedText(payload.title, BLUEPRINT_LIMITS.TITLE_MAX) || 'Untitled Entry';
      const content = sanitizeBoundedText(payload.content, BLUEPRINT_LIMITS.CONTENT_MAX);
      const category = normalizeCategory(payload.category);

      await updateDoc(doc(db, 'users', user.uid, 'journal', id), {
        title,
        content,
        category,
        entryDate,
        updatedAt: serverTimestamp(),
      });

      return { id, title, content, category, entryDate, updatedAt: nowIso };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.UPDATE,
        docPath,
        'Cloud Firestore · journal',
        'PATCH',
        'Failed to update journal entry.',
      );
    }
  },

  async remove(id: string): Promise<void> {
    const user = requireAuthenticatedUser('Cloud Firestore · journal', 'DELETE');
    const docPath = `users/${user.uid}/journal/${id}`;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journal', id));
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.DELETE,
        docPath,
        'Cloud Firestore · journal',
        'DELETE',
        'Failed to delete journal entry.',
      );
    }
  },
};
