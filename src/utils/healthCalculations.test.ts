import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCycleLengths,
  calculateHydrationMetrics,
  calculatePeriodEstimate,
  filterJournalEntries,
  sumNutritionMacros,
} from './healthCalculations';
import type { JournalEntry, NutritionMealItem, PeriodRecord } from '../types/api';

test('calculateCycleLengths and calculatePeriodEstimate derive predictions from real records', () => {
  const periods: PeriodRecord[] = [
    {
      id: '1',
      startDate: '2026-09-04',
      endDate: '2026-09-08',
      flowIntensity: 'Moderate',
      symptoms: ['Cramps'],
    },
    {
      id: '2',
      startDate: '2026-10-02',
      endDate: '2026-10-06',
      flowIntensity: 'Moderate',
      symptoms: ['Fatigue'],
    },
  ];
  assert.deepEqual(calculateCycleLengths(periods), [28]);
  const estimate = calculatePeriodEstimate(periods, '2026-10-15');
  assert.ok(estimate);
  assert.equal(estimate.averageCycleLength, 28);
  assert.equal(estimate.currentCycleDay, 14);
  assert.equal(estimate.currentPhase, 'Ovulation');
  assert.equal(estimate.nextPeriodStart, '2026-10-30');
});

test('calculatePeriodEstimate returns null when there are no records', () => {
  assert.equal(calculatePeriodEstimate([], '2026-10-15'), null);
});

test('sumNutritionMacros accurately totals calories and macros', () => {
  const meals: NutritionMealItem[] = [
    {
      id: 'm1',
      date: '2026-10-24',
      mealType: 'Breakfast',
      foodName: 'Avocado Toast',
      portion: '1 serving',
      calories: 420,
      proteinGrams: 14,
      carbsGrams: 32,
      fatGrams: 18,
      fiberGrams: 7,
    },
    {
      id: 'm2',
      date: '2026-10-24',
      mealType: 'Lunch',
      foodName: 'Quinoa Bowl',
      portion: '1 bowl',
      calories: 580,
      proteinGrams: 38,
      carbsGrams: 45,
      fatGrams: 22,
      fiberGrams: 9,
    },
  ];
  assert.deepEqual(sumNutritionMacros(meals), {
    calories: 1000,
    proteinGrams: 52,
    carbsGrams: 77,
    fatGrams: 40,
    fiberGrams: 16,
  });
});

test('calculateHydrationMetrics computes percentage and SVG stroke offset', () => {
  const half = calculateHydrationMetrics(1000, 2000, 70);
  assert.equal(half.percentage, 50);
  assert.equal(half.clampedBarPercent, 50);
  assert.equal(half.strokeDashoffset, Number((half.circumference / 2).toFixed(2)));
});

test('filterJournalEntries filters by category and search query', () => {
  const entries: JournalEntry[] = [
    {
      id: 'j1',
      title: 'Follicular Energy',
      content: 'Felt energized after walk',
      category: 'Cycle Tracking',
      entryDate: '2026-10-20T09:00',
    },
    {
      id: 'j2',
      title: 'Inositol Notes',
      content: 'Consistent supplement timing',
      category: 'PCOS Symptom Log',
      entryDate: '2026-10-22T20:00',
    },
  ];
  assert.equal(filterJournalEntries(entries, 'inositol', 'All').length, 1);
  assert.equal(filterJournalEntries(entries, '', 'Cycle Tracking').length, 1);
  assert.equal(filterJournalEntries(entries, 'inositol', 'Cycle Tracking').length, 0);
});
