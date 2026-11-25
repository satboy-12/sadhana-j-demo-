import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluatePasswordStrength,
  validateEmail,
  validateJournalInput,
  validateMealInput,
  validatePeriodDates,
  validateRegistrationForm,
} from './validation';

test('validateEmail rejects empty and malformed emails and accepts valid emails', () => {
  assert.ok(validateEmail(''));
  assert.ok(validateEmail('not-an-email'));
  assert.equal(validateEmail('elena@herhealth.org'), null);
});

test('evaluatePasswordStrength scores weak, moderate, and strong passwords', () => {
  assert.equal(evaluatePasswordStrength('').score, 0);
  assert.equal(evaluatePasswordStrength('abc').score, 0);
  assert.equal(evaluatePasswordStrength('abcdefgh').tone, 'error');
  assert.equal(evaluatePasswordStrength('Abcdefg1').tone, 'secondary');
  assert.equal(evaluatePasswordStrength('Abcdefg1!').tone, 'tertiary');
});

test('validateRegistrationForm checks matching passwords and privacy consent', () => {
  const errors = validateRegistrationForm({
    fullName: 'A',
    email: 'bad',
    password: 'short',
    confirmPassword: 'other',
    acceptedPrivacy: false,
  });
  assert.ok(errors.fullName);
  assert.ok(errors.email);
  assert.ok(errors.password);
  assert.ok(errors.confirmPassword);
  assert.ok(errors.acceptedPrivacy);

  const valid = validateRegistrationForm({
    fullName: 'Elena Vance',
    email: 'elena@example.com',
    password: 'Password1!',
    confirmPassword: 'Password1!',
    acceptedPrivacy: true,
  });
  assert.deepEqual(valid, {});
});

test('validatePeriodDates enforces start <= end and reasonable range', () => {
  assert.ok(validatePeriodDates('2026-10-10', '2026-10-05'));
  assert.ok(validatePeriodDates('2026-10-01', '2026-10-30'));
  assert.equal(validatePeriodDates('2026-10-02', '2026-10-06'), null);
});

test('validateMealInput and validateJournalInput enforce required fields and bounds', () => {
  assert.ok(validateMealInput({ foodName: '', portion: '', calories: -10 }).foodName);
  assert.deepEqual(validateMealInput({ foodName: 'Oatmeal', portion: '1 bowl', calories: 320 }), {});
  assert.ok(validateJournalInput({ title: '', content: '', entryDate: '' }).title);
});
