import type {
  JournalCategory,
  JournalEntry,
  NutritionMealItem,
  PeriodEstimate,
  PeriodRecord,
} from '../types/api';

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export function diffDaysInclusive(startDate: string, endDate: string): number {
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  return Math.max(1, Math.round((end.getTime() - start.getTime()) / MS_PER_DAY) + 1);
}

export function addDaysIso(dateStr: string, days: number): string {
  const date = new Date(`${dateStr}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function calculateCycleLengths(periods: PeriodRecord[]): number[] {
  if (periods.length < 2) return [];
  const sorted = [...periods].sort((a, b) => a.startDate.localeCompare(b.startDate));
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = new Date(`${sorted[i - 1].startDate}T00:00:00Z`).getTime();
    const curr = new Date(`${sorted[i].startDate}T00:00:00Z`).getTime();
    const days = Math.round((curr - prev) / MS_PER_DAY);
    if (days >= 15 && days <= 90) {
      lengths.push(days);
    }
  }
  return lengths;
}

export function calculatePeriodEstimate(
  periods: PeriodRecord[],
  referenceDateIso: string,
): PeriodEstimate | null {
  if (periods.length === 0) return null;

  const sortedDesc = [...periods].sort((a, b) => b.startDate.localeCompare(a.startDate));
  const latest = sortedDesc[0];
  const cycleLengths = calculateCycleLengths(periods);
  const averageCycleLength =
    cycleLengths.length > 0
      ? Math.round(cycleLengths.reduce((sum, len) => sum + len, 0) / cycleLengths.length)
      : 28;

  let regularityScore: number | null = null;
  if (cycleLengths.length >= 2) {
    const variance =
      cycleLengths.reduce((sum, len) => sum + Math.abs(len - averageCycleLength), 0) /
      cycleLengths.length;
    regularityScore = Math.max(40, Math.min(100, Math.round(100 - variance * 6)));
  }

  const latestDuration = diffDaysInclusive(latest.startDate, latest.endDate);
  const nextPeriodStart = addDaysIso(latest.startDate, averageCycleLength);
  const nextPeriodEnd = addDaysIso(nextPeriodStart, Math.max(3, latestDuration) - 1);
  const ovulationDate = addDaysIso(nextPeriodStart, -14);
  const fertileWindowStart = addDaysIso(ovulationDate, -3);
  const fertileWindowEnd = addDaysIso(ovulationDate, 1);

  const refMs = new Date(`${referenceDateIso}T00:00:00Z`).getTime();
  const latestStartMs = new Date(`${latest.startDate}T00:00:00Z`).getTime();
  const currentCycleDay = Math.round((refMs - latestStartMs) / MS_PER_DAY) + 1;

  let currentPhase: PeriodEstimate['currentPhase'] = 'Uncharted';
  if (currentCycleDay >= 1 && currentCycleDay <= latestDuration) {
    currentPhase = 'Menstrual';
  } else if (currentCycleDay > latestDuration && currentCycleDay < averageCycleLength - 16) {
    currentPhase = 'Follicular';
  } else if (currentCycleDay >= averageCycleLength - 16 && currentCycleDay <= averageCycleLength - 12) {
    currentPhase = 'Ovulation';
  } else if (currentCycleDay > averageCycleLength - 12 && currentCycleDay <= averageCycleLength + 7) {
    currentPhase = 'Luteal';
  }

  return {
    nextPeriodStart,
    nextPeriodEnd,
    fertileWindowStart,
    fertileWindowEnd,
    ovulationDate,
    currentCycleDay: currentCycleDay >= 1 ? currentCycleDay : null,
    currentPhase,
    averageCycleLength,
    regularityScore,
  };
}

export interface MacroTotals {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export function sumNutritionMacros(meals: NutritionMealItem[]): MacroTotals {
  return meals.reduce<MacroTotals>(
    (acc, item) => ({
      calories: acc.calories + (Number(item.calories) || 0),
      proteinGrams: acc.proteinGrams + (Number(item.proteinGrams) || 0),
      carbsGrams: acc.carbsGrams + (Number(item.carbsGrams) || 0),
      fatGrams: acc.fatGrams + (Number(item.fatGrams) || 0),
      fiberGrams: acc.fiberGrams + (Number(item.fiberGrams) || 0),
    }),
    { calories: 0, proteinGrams: 0, carbsGrams: 0, fatGrams: 0, fiberGrams: 0 },
  );
}

export function calculateHydrationMetrics(
  totalMl: number,
  targetMl: number,
  radius = 70,
): {
  percentage: number;
  clampedBarPercent: number;
  circumference: number;
  strokeDashoffset: number;
} {
  const safeTarget = targetMl > 0 ? targetMl : 2000;
  const safeTotal = Math.max(0, totalMl);
  const percentage = Math.round((safeTotal / safeTarget) * 100);
  const clampedRatio = Math.min(1, safeTotal / safeTarget);
  const circumference = Number((2 * Math.PI * radius).toFixed(2));
  const strokeDashoffset = Number((circumference * (1 - clampedRatio)).toFixed(2));
  return {
    percentage,
    clampedBarPercent: Math.round(clampedRatio * 100),
    circumference,
    strokeDashoffset,
  };
}

export function filterJournalEntries(
  entries: JournalEntry[],
  searchQuery: string,
  categoryFilter: 'All' | JournalCategory,
): JournalEntry[] {
  const q = searchQuery.trim().toLowerCase();
  return entries
    .filter((entry) => {
      if (categoryFilter !== 'All' && entry.category !== categoryFilter) {
        return false;
      }
      if (!q) return true;
      return (
        entry.title.toLowerCase().includes(q) ||
        entry.content.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.entryDate.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => b.entryDate.localeCompare(a.entryDate));
}
