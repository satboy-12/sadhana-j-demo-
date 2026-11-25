import test from 'node:test';
import assert from 'node:assert/strict';
import { buildClinicalSummary, formatShortDate, formatLongDate } from './uiHelpers';
import type { PcosSymptomLog } from '../types/api';

test('formatShortDate and formatLongDate format ISO dates predictably', () => {
  assert.equal(formatShortDate('2026-10-14'), '14 Oct');
  assert.match(formatLongDate('2026-10-14'), /Wed.*14 Oct/);
  assert.equal(formatShortDate(''), '—');
});

test('buildClinicalSummary summarizes logs accurately and handles empty input', () => {
  const emptyText = buildClinicalSummary([]);
  assert.match(emptyText, /No PCOS symptom entries/);

  const logs: PcosSymptomLog[] = [
    {
      id: 's1',
      date: '2026-10-10',
      symptoms: ['Fatigue', 'Acne / Skin'],
      severity: 4,
      painLevel: 6,
      energyLevel: 2,
      observations: 'Tired after work',
    },
    {
      id: 's2',
      date: '2026-10-12',
      symptoms: ['Fatigue'],
      severity: 2,
      painLevel: 2,
      energyLevel: 4,
      observations: '',
    },
  ];
  const text = buildClinicalSummary(logs);
  assert.match(text, /Symptom days logged: 2/);
  assert.match(text, /Average severity: 3\.0\/5/);
  assert.match(text, /Fatigue: 2 of 2 logged days \(100%\)/);
});
