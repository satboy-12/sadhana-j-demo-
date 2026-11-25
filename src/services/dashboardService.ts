import type { DashboardSummary } from '../types/api';
import { ApiError } from '../api/client';
import { OperationType } from '../utils/firestoreErrors';
import { periodsService } from './periodService';
import { symptomsService } from './symptomService';
import { wellnessService } from './wellnessService';
import { nutritionService } from './nutritionService';
import { waterService } from './waterService';
import { journalService } from './journalService';
import { profileService } from './profileService';
import {
  isPermissionDeniedError,
  requireAuthenticatedUser,
  wrapFirestoreError,
} from './firestoreServiceErrors';
import { buildDashboardSummary, type DashboardBuildInput } from './dashboardSummaryBuilder';

export { buildDashboardSummary, type DashboardBuildInput };

function isCriticalError(err: unknown): boolean {
  if (isPermissionDeniedError(err)) return true;
  if (err instanceof Error) {
    try {
      const parsed = JSON.parse(err.message) as { operationType?: string; error?: string };
      if (parsed && parsed.error && parsed.operationType) return true;
    } catch {
      // not FirestoreErrorInfo JSON
    }
  }
  return (
    err instanceof ApiError &&
    (err.code === 'FORBIDDEN' || err.code === 'UNAUTHORIZED' || err.code === 'BACKEND_UNAVAILABLE')
  );
}

export const dashboardService = {
  async getSummary(): Promise<DashboardSummary> {
    const user = requireAuthenticatedUser('Cloud Firestore · dashboard', 'GET');
    const todayIso = new Date().toISOString().slice(0, 10);

    try {
      const profile = await profileService.get();

      const results = await Promise.allSettled([
        periodsService.list(),
        symptomsService.list(),
        wellnessService.list(),
        nutritionService.getSummary(todayIso),
        waterService.getStatus(todayIso),
        journalService.list(),
      ]);

      // Never silence PERMISSION_DENIED, UNAUTHORIZED, or network unavailability
      for (const res of results) {
        if (res.status === 'rejected' && isCriticalError(res.reason)) {
          throw res.reason;
        }
      }

      const [periodsRes, symptomsRes, wellnessRes, nutritionRes, waterRes, journalRes] = results;

      return buildDashboardSummary({
        userName: profile.fullName,
        todayIso,
        periods: periodsRes.status === 'fulfilled' ? periodsRes.value : [],
        symptoms: symptomsRes.status === 'fulfilled' ? symptomsRes.value : [],
        wellnessEntries: wellnessRes.status === 'fulfilled' ? wellnessRes.value : [],
        nutritionSummary: nutritionRes.status === 'fulfilled' ? nutritionRes.value : null,
        waterStatus: waterRes.status === 'fulfilled' ? waterRes.value : null,
        journalEntries: journalRes.status === 'fulfilled' ? journalRes.value : [],
      });
    } catch (err) {
      if (err instanceof Error) {
        try {
          const parsed = JSON.parse(err.message) as { operationType?: string; error?: string };
          if (parsed && parsed.error && parsed.operationType) {
            throw err;
          }
        } catch (parseErr) {
          if (parseErr === err) throw err;
        }
      }
      wrapFirestoreError(
        err,
        OperationType.GET,
        `users/${user.uid}`,
        'Cloud Firestore · dashboard',
        'GET',
        'Failed to load dashboard summary.',
      );
    }
  },
};
