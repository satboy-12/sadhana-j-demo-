import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import type { WaterIntakeRecord, WaterTrackerResponse } from '../types/api';
import { OperationType } from '../utils/firestoreErrors';
import { BLUEPRINT_LIMITS } from '../utils/validation';
import { ensureUserAccountAndProfile } from './authService';
import { requireAuthenticatedUser, wrapFirestoreError } from './firestoreServiceErrors';

const DEFAULT_WATER_GOAL_ML = 2500;

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export const waterService = {
  async getDaily(date?: string): Promise<WaterTrackerResponse> {
    const user = requireAuthenticatedUser('Cloud Firestore · water', 'GET');
    const targetDate = date || todayIso();
    const colPath = `users/${user.uid}/water`;
    try {
      const [waterSnap, userSnap] = await Promise.all([
        getDocs(query(collection(db, 'users', user.uid, 'water'), where('userId', '==', user.uid))),
        getDoc(doc(db, 'users', user.uid)),
      ]);

      const accountData = userSnap.exists() ? (userSnap.data() as Record<string, unknown>) : {};
      const dailyTargetMl =
        accountData.dailyWaterTargetMl !== undefined && Number(accountData.dailyWaterTargetMl) > 0
          ? Number(accountData.dailyWaterTargetMl)
          : DEFAULT_WATER_GOAL_ML;
      const remindersEnabled =
        accountData.hydrationNudges !== undefined ? Boolean(accountData.hydrationNudges) : true;

      let totalIntakeMl = 0;
      const entries: WaterIntakeRecord[] = [];
      const allRecords = waterSnap.docs.map((d) => ({
        id: d.id,
        data: d.data() as Record<string, unknown>,
      }));

      allRecords.forEach(({ id, data }) => {
        if (data.date === targetDate && Number(data.amountMl) > 0) {
          const amountMl = Number(data.amountMl);
          totalIntakeMl += amountMl;
          const loggedAt = data.loggedAt
            ? String(data.loggedAt)
            : data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : '';
          entries.push({
            id,
            date: String(data.date),
            amountMl,
            loggedAt,
          });
        }
      });

      const weeklyHistory: Array<{ date: string; dayLabel: string; totalMl: number }> = [];
      const anchor = new Date(`${targetDate}T00:00:00Z`);
      for (let i = 6; i >= 0; i -= 1) {
        const d = new Date(anchor);
        d.setUTCDate(anchor.getUTCDate() - i);
        const iso = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });

        let dayTotal = 0;
        allRecords.forEach(({ data }) => {
          if (data.date === iso && Number(data.amountMl) > 0) {
            dayTotal += Number(data.amountMl);
          }
        });
        weeklyHistory.push({ date: iso, dayLabel, totalMl: dayTotal });
      }

      return {
        date: targetDate,
        dailyTargetMl,
        totalIntakeMl,
        remindersEnabled,
        entries,
        weeklyHistory,
      };
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.LIST,
        colPath,
        'Cloud Firestore · water',
        'GET',
        'Failed to load water intake.',
      );
    }
  },

  async getStatus(date?: string): Promise<WaterTrackerResponse> {
    return this.getDaily(date);
  },

  async logIntake(payload: { date: string; amountMl: number }): Promise<WaterTrackerResponse> {
    const user = requireAuthenticatedUser('Cloud Firestore · water', 'POST');
    const targetDate = payload.date || todayIso();
    const colPath = `users/${user.uid}/water`;
    try {
      await ensureUserAccountAndProfile(user);
      const amount = Math.max(
        BLUEPRINT_LIMITS.WATER_MIN_ML,
        Math.min(BLUEPRINT_LIMITS.WATER_MAX_ML, Math.round(Number(payload.amountMl) || 0)),
      );
      const loggedAt =
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }) || '12:00';

      await addDoc(collection(db, 'users', user.uid, 'water'), {
        userId: user.uid,
        date: targetDate,
        amountMl: amount,
        loggedAt: loggedAt.slice(0, 40),
        createdAt: serverTimestamp(),
      });

      return this.getDaily(targetDate);
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.CREATE,
        colPath,
        'Cloud Firestore · water',
        'POST',
        'Failed to log water intake.',
      );
    }
  },

  async updatePreferences(prefs: {
    dailyTargetMl?: number;
    remindersEnabled?: boolean;
  }): Promise<WaterTrackerResponse> {
    const user = requireAuthenticatedUser('Cloud Firestore · water', 'PATCH');
    const docPath = `users/${user.uid}`;
    try {
      await ensureUserAccountAndProfile(user);
      const updates: Record<string, unknown> = {};
      if (prefs.dailyTargetMl !== undefined) {
        updates.dailyWaterTargetMl = Math.max(
          BLUEPRINT_LIMITS.TARGET_MIN,
          Math.min(BLUEPRINT_LIMITS.TARGET_MAX, Math.round(Number(prefs.dailyTargetMl))),
        );
      }
      if (prefs.remindersEnabled !== undefined) {
        updates.hydrationNudges = Boolean(prefs.remindersEnabled);
      }
      if (Object.keys(updates).length > 0) {
        updates.updatedAt = serverTimestamp();
        await updateDoc(doc(db, 'users', user.uid), updates);
      }
      return this.getStatus(todayIso());
    } catch (err) {
      wrapFirestoreError(
        err,
        OperationType.UPDATE,
        docPath,
        'Cloud Firestore · water',
        'PATCH',
        'Failed to update hydration settings.',
      );
    }
  },
};
