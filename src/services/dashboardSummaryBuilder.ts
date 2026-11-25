import type {
  DashboardSummary,
  JournalEntry,
  NutritionSummaryResponse,
  PcosSymptomLog,
  PeriodRecord,
  WaterTrackerResponse,
  WellnessEntry,
} from '../types/api';
import { calculatePeriodEstimate } from '../utils/healthCalculations';

export interface DashboardBuildInput {
  userName: string;
  todayIso: string;
  periods: PeriodRecord[];
  symptoms: PcosSymptomLog[];
  wellnessEntries: WellnessEntry[];
  nutritionSummary: NutritionSummaryResponse | null;
  waterStatus: WaterTrackerResponse | null;
  journalEntries: JournalEntry[];
}

export function buildDashboardSummary({
  userName,
  todayIso,
  periods,
  symptoms,
  wellnessEntries,
  nutritionSummary,
  waterStatus,
  journalEntries,
}: DashboardBuildInput): DashboardSummary {
  const estimate = calculatePeriodEstimate(periods, todayIso);
  const daysUntilNextPeriod = estimate?.nextPeriodStart
    ? Math.round(
        (new Date(`${estimate.nextPeriodStart}T00:00:00Z`).getTime() -
          new Date(`${todayIso}T00:00:00Z`).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const latestWellness = wellnessEntries[0] || null;
  let wellnessInsight: string | null = null;
  if (latestWellness) {
    if (latestWellness.mood === 'Radiant') {
      wellnessInsight = 'Restorative balance noted — ideal window for steady movement and hydration.';
    } else if (latestWellness.mood === 'Fatigued' || latestWellness.mood === 'Low') {
      wellnessInsight = 'Prioritize earlier rest, warm hydration, and gentle nutrient-dense meals.';
    } else if (latestWellness.stressLevel >= 7) {
      wellnessInsight = 'Elevated stress recorded. Consider quiet breathwork and recovery sleep tonight.';
    } else {
      wellnessInsight = `Latest check-in (${latestWellness.mood}) recorded with ${latestWellness.sleepHours}h sleep.`;
    }
  }

  const caloriesConsumed = nutritionSummary
    ? nutritionSummary.meals.reduce((sum, m) => sum + (m.calories || 0), 0)
    : 0;

  const cycleHistory = [...periods]
    .filter((p) => typeof p.cycleLengthDays === 'number' && p.cycleLengthDays > 0 && p.startDate)
    .slice(0, 6)
    .reverse()
    .map((p) => ({
      month: new Date(`${p.startDate}T00:00:00Z`).toLocaleDateString('en-US', {
        month: 'short',
        timeZone: 'UTC',
      }),
      lengthDays: p.cycleLengthDays as number,
    }));

  return {
    userName,
    cycleSummary: {
      currentDay: estimate?.currentCycleDay ?? null,
      phase: estimate?.currentPhase ?? 'Uncharted',
      daysUntilNextPeriod,
      nextPeriodDate: estimate?.nextPeriodStart ?? null,
      fertilityStatus:
        estimate?.currentPhase === 'Ovulation'
          ? 'Peak Fertile'
          : estimate?.currentPhase === 'Follicular'
          ? 'Opening Window'
          : estimate
          ? 'Low'
          : null,
      averageCycleLength: estimate?.averageCycleLength ?? null,
      cycleHistory,
    },
    wellnessSummary: {
      mood: latestWellness?.mood ?? null,
      sleepHours: latestWellness ? latestWellness.sleepHours : null,
      energyLevel: latestWellness
        ? latestWellness.stressLevel <= 3
          ? 'High'
          : latestWellness.stressLevel <= 6
          ? 'Steady'
          : 'Low'
        : null,
      insight: wellnessInsight,
    },
    waterSummary: {
      intakeMl: waterStatus?.totalIntakeMl ?? 0,
      targetMl: waterStatus?.dailyTargetMl ?? 2500,
    },
    latestSymptom: symptoms[0] ?? null,
    nutritionSummary: {
      caloriesConsumed,
      caloriesTarget: nutritionSummary?.targets.calories ?? 2000,
      antiInflammatoryScore: null,
      sugarStatus: caloriesConsumed > 0 ? 'Logged today' : null,
    },
    recentJournalEntries: journalEntries.slice(0, 3),
  };
}
