import type { PcosSymptomLog, PeriodEstimate, PeriodRecord } from '../types/api';

export interface PhaseMeta {
  name: string;
  pillClass: string;
  color: string;
  ink: string;
  bgSoft: string;
  tip: string;
}

export const PHASE_META: Record<
  'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Uncharted',
  PhaseMeta
> = {
  Menstrual: {
    name: 'Menstrual',
    pillClass: 'bg-[var(--men-soft)] text-[var(--men-ink)]',
    color: 'var(--c-men)',
    ink: 'var(--men-ink)',
    bgSoft: 'var(--men-soft)',
    tip: 'Energy is often lowest. Iron-rich foods (lentils, spinach, whole grains), warmth, and gentle movement can ease cramps and fatigue.',
  },
  Follicular: {
    name: 'Follicular',
    pillClass: 'bg-[var(--fol-soft)] text-[var(--fol-ink)]',
    color: 'var(--c-fol)',
    ink: 'var(--fol-ink)',
    bgSoft: 'var(--fol-soft)',
    tip: 'Estrogen rises and energy usually follows. A supportive window for strength training, steady protein, and starting focused routines.',
  },
  Ovulation: {
    name: 'Ovulation',
    pillClass: 'bg-[var(--ovu-soft)] text-[var(--ovu-ink)]',
    color: 'var(--c-ovu)',
    ink: 'var(--ovu-ink)',
    bgSoft: 'var(--ovu-soft)',
    tip: 'Fertility peaks around ovulation. Hydration, zinc-rich seeds, and balanced meals help keep energy steady.',
  },
  Luteal: {
    name: 'Luteal',
    pillClass: 'bg-[var(--lut-soft)] text-[var(--lut-ink)]',
    color: 'var(--c-lut)',
    ink: 'var(--lut-ink)',
    bgSoft: 'var(--lut-soft)',
    tip: 'Progesterone rises. Steady blood sugar helps: complex carbs, protein, and magnesium-rich foods can soften cravings and pre-period fatigue.',
  },
  Uncharted: {
    name: 'Not started',
    pillClass: 'bg-[var(--plum-soft)] text-[var(--plum)]',
    color: 'var(--muted)',
    ink: 'var(--muted)',
    bgSoft: 'var(--surface2)',
    tip: 'Log your most recent period start and end dates to calculate cycle phase insights and estimated windows.',
  },
};

export interface CommonFoodPreset {
  foodName: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export const COMMON_FOODS: CommonFoodPreset[] = [
  { foodName: 'Oats with berries', portion: '1 bowl', calories: 320, proteinGrams: 11, carbsGrams: 54, fatGrams: 7, fiberGrams: 9 },
  { foodName: 'Greek yogurt', portion: '170 g', calories: 110, proteinGrams: 17, carbsGrams: 7, fatGrams: 1, fiberGrams: 0 },
  { foodName: 'Boiled egg', portion: '1 large', calories: 78, proteinGrams: 6, carbsGrams: 0.6, fatGrams: 5, fiberGrams: 0 },
  { foodName: 'Avocado toast', portion: '1 slice', calories: 250, proteinGrams: 6, carbsGrams: 28, fatGrams: 13, fiberGrams: 6 },
  { foodName: 'Lentil dal', portion: '1 bowl', calories: 230, proteinGrams: 13, carbsGrams: 36, fatGrams: 4, fiberGrams: 10 },
  { foodName: 'Brown rice', portion: '1 cup', calories: 215, proteinGrams: 5, carbsGrams: 45, fatGrams: 1.8, fiberGrams: 3.5 },
  { foodName: 'Quinoa bowl', portion: '1 cup', calories: 222, proteinGrams: 8, carbsGrams: 39, fatGrams: 3.6, fiberGrams: 5 },
  { foodName: 'Grilled salmon', portion: '120 g', calories: 250, proteinGrams: 27, carbsGrams: 0, fatGrams: 15, fiberGrams: 0 },
  { foodName: 'Chickpea salad', portion: '1 bowl', calories: 270, proteinGrams: 12, carbsGrams: 40, fatGrams: 7, fiberGrams: 10 },
  { foodName: 'Spinach sabzi', portion: '1 cup', calories: 90, proteinGrams: 4, carbsGrams: 8, fatGrams: 5, fiberGrams: 3.5 },
  { foodName: 'Mixed nuts', portion: '30 g', calories: 180, proteinGrams: 5, carbsGrams: 6, fatGrams: 16, fiberGrams: 2.5 },
  { foodName: 'Apple', portion: '1 medium', calories: 95, proteinGrams: 0.5, carbsGrams: 25, fatGrams: 0.3, fiberGrams: 4.4 },
];

export function formatShortDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12));
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dt);
}

export function formatLongDate(isoDate: string): string {
  if (!isoDate) return '—';
  const parts = isoDate.slice(0, 10).split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return isoDate;
  const dt = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 12));
  return new Intl.DateTimeFormat('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }).format(dt);
}

export function buildClinicalSummary(
  logs: PcosSymptomLog[],
  periods: PeriodRecord[] = [],
  estimate: PeriodEstimate | null = null,
): string {
  const lines: string[] = ['Her Health Journey — Personal Symptom & Cycle Summary', ''];

  if (periods.length > 0) {
    lines.push(
      `Cycles logged: ${periods.length}${
        estimate?.averageCycleLength ? ` · Average length: ${estimate.averageCycleLength} days` : ''
      }${estimate?.regularityScore != null ? ` · Regularity: ${estimate.regularityScore}/100` : ''}`,
    );
  } else {
    lines.push('Cycles logged: None currently loaded.');
  }

  if (logs.length === 0) {
    lines.push('', 'No PCOS symptom entries recorded in the current dataset.');
  } else {
    const avgSeverity = (
      logs.reduce((sum, l) => sum + l.severity, 0) / logs.length
    ).toFixed(1);
    const avgPain = (logs.reduce((sum, l) => sum + l.painLevel, 0) / logs.length).toFixed(1);
    const avgEnergy = (
      logs.reduce((sum, l) => sum + l.energyLevel, 0) / logs.length
    ).toFixed(1);

    const freq: Record<string, number> = {};
    for (const log of logs) {
      for (const s of log.symptoms) {
        freq[s] = (freq[s] || 0) + 1;
      }
    }

    lines.push(
      '',
      `Symptom days logged: ${logs.length}`,
      `Average severity: ${avgSeverity}/5`,
      `Average pelvic pain: ${avgPain}/10`,
      `Average energy score: ${avgEnergy}/5`,
      'Most frequent symptoms:',
    );
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .forEach(([sym, count]) => {
        const pct = Math.round((count / logs.length) * 100);
        lines.push(`- ${sym}: ${count} of ${logs.length} logged days (${pct}%)`);
      });
  }

  lines.push('', 'Self-reported data from personal health tracking. Not a medical diagnosis.');
  return lines.join('\n');
}
