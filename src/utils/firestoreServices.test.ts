import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildInitialPrivateProfileRecord,
  buildInitialUserAccountRecord,
  mapFirestoreDocsToUserProfile,
} from '../services/profileBuilder';
import { buildDashboardSummary } from '../services/dashboardSummaryBuilder';
import { formatClientError } from './errorDisplay';

describe('Cloud Firestore profile builders, error formatting & dashboard summary', () => {
  it('builds split UserAccount & UserPrivateProfile documents and merges them cleanly', () => {
    const fbUser = {
      uid: 'client-uid-123',
      displayName: null,
      email: 'client.one@example.com',
      metadata: { creationTime: '2026-05-01T10:00:00Z' },
    };

    const account = buildInitialUserAccountRecord(fbUser, 'Sophia Laurent', '2026-05-01T10:00:00.000Z');
    const priv = buildInitialPrivateProfileRecord(fbUser);

    assert.equal(account.userId, 'client-uid-123');
    assert.equal(account.fullName, 'Sophia Laurent');
    assert.equal(account.memberSince, '2026-05-01');
    assert.equal(account.dailyCalorieTarget, 2000);
    assert.equal(account.dailyWaterTargetMl, 2500);
    assert.equal(account.hydrationNudges, true);
    assert.equal('email' in account, false); // PII isolated from public/account doc

    assert.equal(priv.userId, 'client-uid-123');
    assert.equal(priv.email, 'client.one@example.com');
    assert.equal(priv.dateOfBirth, '');
    assert.equal(priv.phoneNumber, '');

    const mapped = mapFirestoreDocsToUserProfile('client-uid-123', account, priv, fbUser);
    assert.equal(mapped.id, 'client-uid-123');
    assert.equal(mapped.fullName, 'Sophia Laurent');
    assert.equal(mapped.email, 'client.one@example.com');
    assert.equal(mapped.preferences.dailyCalorieTarget, 2000);
    assert.equal(mapped.preferences.dailyWaterTargetMl, 2500);
  });

  it('derives fallback display name from email prefix when displayName is missing', () => {
    const account = buildInitialUserAccountRecord({
      uid: 'client-uid-456',
      displayName: '',
      email: 'amara.chen@example.com',
    });
    assert.equal(account.fullName, 'amara.chen');
  });

  it('formats structured FirestoreErrorInfo JSON strings into human-readable messages', () => {
    const err = new Error(
      JSON.stringify({
        error: 'Missing or insufficient permissions.',
        operationType: 'list',
        path: 'users/uid-1/journal',
      }),
    );
    const formatted = formatClientError(err, 'Fallback message');
    assert.equal(
      formatted,
      'Cloud Firestore list denied on users/uid-1/journal: Missing or insufficient permissions.',
    );
  });

  it('returns strictly null/empty metrics (zero fabricated values) for a brand-new empty client account', () => {
    const summary = buildDashboardSummary({
      userName: 'Sophia Laurent',
      todayIso: '2026-05-15',
      periods: [],
      symptoms: [],
      wellnessEntries: [],
      nutritionSummary: null,
      waterStatus: null,
      journalEntries: [],
    });

    assert.equal(summary.userName, 'Sophia Laurent');
    assert.equal(summary.cycleSummary.currentDay, null);
    assert.equal(summary.cycleSummary.phase, 'Uncharted');
    assert.equal(summary.cycleSummary.daysUntilNextPeriod, null);
    assert.equal(summary.cycleSummary.nextPeriodDate, null);
    assert.equal(summary.cycleSummary.averageCycleLength, null);
    assert.deepEqual(summary.cycleSummary.cycleHistory, []);

    assert.equal(summary.wellnessSummary.mood, null);
    assert.equal(summary.wellnessSummary.sleepHours, null);
    assert.equal(summary.wellnessSummary.energyLevel, null);
    assert.equal(summary.wellnessSummary.insight, null);

    assert.equal(summary.waterSummary.intakeMl, 0);
    assert.equal(summary.waterSummary.targetMl, 2500);
    assert.equal(summary.latestSymptom, null);
    assert.equal(summary.nutritionSummary.caloriesConsumed, 0);
    assert.equal(summary.nutritionSummary.antiInflammatoryScore, null);
    assert.equal(summary.nutritionSummary.sugarStatus, null);
    assert.deepEqual(summary.recentJournalEntries, []);
  });

  it('computes real cycle, wellness, hydration, and nutrition metrics when user has logged records', () => {
    const summary = buildDashboardSummary({
      userName: 'Maya Patel',
      todayIso: '2026-05-15',
      periods: [
        {
          id: 'p2',
          startDate: '2026-05-02',
          endDate: '2026-05-06',
          cycleLengthDays: 29,
          flowIntensity: 'Moderate',
          symptoms: [],
        },
        {
          id: 'p1',
          startDate: '2026-04-03',
          endDate: '2026-04-07',
          flowIntensity: 'Moderate',
          symptoms: [],
        },
      ],
      symptoms: [
        {
          id: 's1',
          date: '2026-05-14',
          symptoms: ['Fatigue'],
          severity: 2,
          painLevel: 1,
          energyLevel: 4,
          observations: 'Mild morning tiredness',
        },
      ],
      wellnessEntries: [
        {
          id: 'w1',
          date: '2026-05-15',
          mood: 'Radiant',
          sleepHours: 8,
          sleepQuality: 'Good/Restful',
          stressLevel: 2,
          notes: 'Slept peacefully',
        },
      ],
      nutritionSummary: {
        date: '2026-05-15',
        targets: { calories: 1900, proteinGrams: 75, carbsGrams: 220, fatGrams: 60, fiberGrams: 30 },
        meals: [
          {
            id: 'm1',
            date: '2026-05-15',
            mealType: 'Breakfast',
            foodName: 'Oatmeal',
            portion: '1 bowl',
            calories: 420,
            proteinGrams: 14,
            carbsGrams: 65,
            fatGrams: 9,
            fiberGrams: 8,
          },
        ],
        weeklyTotals: [],
      },
      waterStatus: {
        date: '2026-05-15',
        dailyTargetMl: 2200,
        totalIntakeMl: 1250,
        remindersEnabled: true,
        entries: [],
        weeklyHistory: [],
      },
      journalEntries: [
        {
          id: 'j1',
          title: 'Energy Check',
          content: 'Feeling steady today',
          category: 'General Reflection',
          entryDate: '2026-05-15T09:00:00Z',
        },
      ],
    });

    assert.equal(summary.cycleSummary.currentDay, 14);
    assert.equal(summary.cycleSummary.averageCycleLength, 29);
    assert.deepEqual(summary.cycleSummary.cycleHistory, [{ month: 'May', lengthDays: 29 }]);
    assert.equal(summary.wellnessSummary.mood, 'Radiant');
    assert.equal(summary.wellnessSummary.sleepHours, 8);
    assert.equal(summary.wellnessSummary.energyLevel, 'High');
    assert.equal(summary.waterSummary.intakeMl, 1250);
    assert.equal(summary.waterSummary.targetMl, 2200);
    assert.equal(summary.nutritionSummary.caloriesConsumed, 420);
    assert.equal(summary.nutritionSummary.caloriesTarget, 1900);
    assert.equal(summary.recentJournalEntries.length, 1);
  });
});
