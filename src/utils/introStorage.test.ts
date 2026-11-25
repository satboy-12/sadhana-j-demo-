import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clearIntroCompleted,
  markIntroCompleted,
  shouldShowCinematicIntro,
} from './introStorage';

test('intro plays on every fresh website load and pauses after completion until cleared', () => {
  clearIntroCompleted();
  assert.equal(shouldShowCinematicIntro({}), true);

  markIntroCompleted();
  assert.equal(shouldShowCinematicIntro({}), false);

  clearIntroCompleted();
  assert.equal(shouldShowCinematicIntro({}), true);
});

test('autostartBypass skips intro while replayRequested forces intro playback', () => {
  markIntroCompleted();
  assert.equal(shouldShowCinematicIntro({ replayRequested: true }), true);
  assert.equal(shouldShowCinematicIntro({ autostartBypass: true }), false);
  clearIntroCompleted();
  assert.equal(shouldShowCinematicIntro({ autostartBypass: true }), false);
});
