import test from 'node:test';
import assert from 'node:assert/strict';
import { EMERALD_BLOOM_TIMELINE, GOLD_MOTES } from './cinematicSequence';

test('Emerald Bloom 5-scene timeline progresses sequentially within ~5 seconds', () => {
  assert.equal(EMERALD_BLOOM_TIMELINE.scene1AwakeningStart, 0);
  assert.ok(EMERALD_BLOOM_TIMELINE.scene2BloomStart > EMERALD_BLOOM_TIMELINE.scene1AwakeningStart);
  assert.ok(EMERALD_BLOOM_TIMELINE.scene3LogoRevealStart > EMERALD_BLOOM_TIMELINE.scene2BloomStart);
  assert.ok(EMERALD_BLOOM_TIMELINE.scene4BrandRevealStart > EMERALD_BLOOM_TIMELINE.scene3LogoRevealStart);
  assert.ok(EMERALD_BLOOM_TIMELINE.scene5TaglineRevealStart > EMERALD_BLOOM_TIMELINE.scene4BrandRevealStart);
  assert.ok(
    EMERALD_BLOOM_TIMELINE.exitStartMs >= 4800 && EMERALD_BLOOM_TIMELINE.exitStartMs <= 5500,
  );
  assert.ok(EMERALD_BLOOM_TIMELINE.reducedMotionHoldMs < EMERALD_BLOOM_TIMELINE.exitStartMs);
});

test('Gold particles have valid deterministic positions inside viewport bounds', () => {
  assert.ok(GOLD_MOTES.length >= 10);
  for (const mote of GOLD_MOTES) {
    assert.ok(mote.xPercent > 5 && mote.xPercent < 95);
    assert.ok(mote.yPercent > 5 && mote.yPercent < 95);
    assert.ok(mote.sizePx > 0 && mote.sizePx <= 4);
    assert.ok(mote.peakOpacity > 0 && mote.peakOpacity <= 0.7);
  }
});
