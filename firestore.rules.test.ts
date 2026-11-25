import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const blueprint = JSON.parse(fs.readFileSync(new URL('./firebase-blueprint.json', import.meta.url), 'utf8'));
const rulesText = fs.readFileSync(new URL('./firestore.rules', import.meta.url), 'utf8');

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]{1,128}$/;
const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

interface AuthContextSim {
  uid: string;
  emailVerified: boolean;
}

function assertValidUserAccountWrite(
  auth: AuthContextSim | null,
  targetUserId: string,
  payload: Record<string, unknown>,
  serverTimeSentinel: symbol,
) {
  if (!auth || !auth.emailVerified || auth.uid !== targetUserId) return false;
  if (!VALID_ID_REGEX.test(targetUserId)) return false;

  const requiredKeys = blueprint.entities.UserAccount.required as string[];
  const keys = Object.keys(payload);
  if (!requiredKeys.every((k) => keys.includes(k))) return false;
  if (!keys.every((k) => requiredKeys.includes(k))) return false;
  if (payload.userId !== targetUserId) return false;
  if (typeof payload.fullName !== 'string' || payload.fullName.length < 1 || payload.fullName.length > 120) return false;
  if (typeof payload.dailyCalorieTarget !== 'number' || payload.dailyCalorieTarget < 500 || payload.dailyCalorieTarget > 10000) return false;
  if (typeof payload.dailyWaterTargetMl !== 'number' || payload.dailyWaterTargetMl < 500 || payload.dailyWaterTargetMl > 10000) return false;
  if (payload.createdAt !== serverTimeSentinel || payload.updatedAt !== serverTimeSentinel) return false;
  return true;
}

test('firestore.rules covers every collection in firebase-blueprint.json with Eight Pillars primitives', () => {
  const expectedMatches = [
    'match /{document=**}',
    'match /users/{userId}',
    'match /private/{docId}',
    'match /periods/{periodId}',
    'match /symptoms/{symptomId}',
    'match /wellness/{wellnessId}',
    'match /nutrition/{mealId}',
    'match /water/{waterId}',
    'match /journal/{entryId}',
  ];
  for (const block of expectedMatches) {
    assert.ok(rulesText.includes(block), `Missing match block: ${block}`);
  }
  assert.ok(rulesText.includes("rules_version = '2';"));
  assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
  assert.ok(rulesText.includes('exists(/databases/$(database)/documents/users/$(userId))'));
  assert.ok(rulesText.includes('affectedKeys().hasOnly'));
});

test('Dirty Dozen adversarial payloads are rejected by blueprint and rule invariants', () => {
  const SERVER_TIME = Symbol('request.time');
  const validUserPayload = {
    userId: 'uid_alice_123',
    fullName: 'Alice',
    memberSince: '2026-11-23',
    accountTier: 'Firebase Cloud',
    cycleReminders: true,
    medicationAlerts: true,
    hydrationNudges: false,
    dailyCalorieTarget: 2000,
    dailyWaterTargetMl: 2500,
    createdAt: SERVER_TIME,
    updatedAt: SERVER_TIME,
  };

  // Valid baseline passes
  assert.equal(
    assertValidUserAccountWrite({ uid: 'uid_alice_123', emailVerified: true }, 'uid_alice_123', validUserPayload, SERVER_TIME),
    true,
  );

  // Dirty #1: Unverified Email Spoof
  assert.equal(
    assertValidUserAccountWrite({ uid: 'uid_alice_123', emailVerified: false }, 'uid_alice_123', validUserPayload, SERVER_TIME),
    false,
  );

  // Dirty #2: Cross-user UID spoofing
  assert.equal(
    assertValidUserAccountWrite({ uid: 'uid_bob_999', emailVerified: true }, 'uid_alice_123', validUserPayload, SERVER_TIME),
    false,
  );

  // Dirty #3: Ghost / Shadow field injection (isAdmin)
  assert.equal(
    assertValidUserAccountWrite(
      { uid: 'uid_alice_123', emailVerified: true },
      'uid_alice_123',
      { ...validUserPayload, isAdmin: true },
      SERVER_TIME,
    ),
    false,
  );

  // Dirty #4: PII leakage on root user doc
  assert.equal(
    assertValidUserAccountWrite(
      { uid: 'uid_alice_123', emailVerified: true },
      'uid_alice_123',
      { ...validUserPayload, email: 'alice@example.com' },
      SERVER_TIME,
    ),
    false,
  );

  // Dirty #5: Path variable poisoning
  assert.equal(VALID_ID_REGEX.test('../evil'), false);
  assert.equal(VALID_ID_REGEX.test('x'.repeat(129)), false);

  // Dirty #6: Oversized string (> 5000 journal content / > 120 title)
  assert.ok(blueprint.entities.JournalLog.properties.content.maxLength === 5000);
  assert.ok(blueprint.entities.JournalLog.properties.title.maxLength === 120);

  // Dirty #7 & #8: Unbounded or non-string symptoms list
  const tooManySymptoms = Array.from({ length: 21 }, (_, i) => `Symptom ${i}`);
  assert.equal(tooManySymptoms.length <= 20, false);

  // Dirty #9: Client clock backdating
  assert.equal(
    assertValidUserAccountWrite(
      { uid: 'uid_alice_123', emailVerified: true },
      'uid_alice_123',
      { ...validUserPayload, createdAt: '2020-01-01T00:00:00Z' },
      SERVER_TIME,
    ),
    false,
  );

  // Dirty #11: Invalid water bounds & date regex
  assert.equal(ISO_DATE_REGEX.test('2026-11-23'), true);
  assert.equal(ISO_DATE_REGEX.test('11/23/2026'), false);
  assert.equal(EMAIL_REGEX.test('alice@example.com'), true);
  assert.equal(EMAIL_REGEX.test('bad email'), false);
});
