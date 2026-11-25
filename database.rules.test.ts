import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

describe('database.rules.json owner-isolation invariants', () => {
  const rulesPath = path.resolve(process.cwd(), 'database.rules.json');
  const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));

  it('denies unauthenticated or root reads and writes by default', () => {
    assert.equal(rules.rules['.read'], false);
    assert.equal(rules.rules['.write'], false);
  });

  it('scopes users/$uid strictly to auth != null && auth.uid === $uid', () => {
    const uidNode = rules.rules.users.$uid;
    assert.equal(uidNode['.read'], 'auth != null && auth.uid === $uid');
    assert.equal(uidNode['.write'], 'auth != null && auth.uid === $uid');
  });

  it('defines validation rules for profile and all six health tracker paths', () => {
    const uidNode = rules.rules.users.$uid;
    for (const key of ['profile', 'periods', 'symptoms', 'wellness', 'nutrition', 'water', 'journal']) {
      assert.ok(uidNode[key], `Missing rule block for users/$uid/${key}`);
    }
    assert.ok(String(uidNode.profile['.validate']).includes('fullName'));
    assert.ok(String(uidNode.profile['.validate']).includes('email'));
  });
});
