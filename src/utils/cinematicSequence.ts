export interface GoldMote {
  id: number;
  xPercent: number;
  yPercent: number;
  sizePx: number;
  driftX: number;
  driftY: number;
  delay: number;
  duration: number;
  peakOpacity: number;
}

/**
 * 5-Scene timeline (~5.0s active choreography + 0.65s dissolve into homepage).
 */
export const EMERALD_BLOOM_TIMELINE = {
  scene1AwakeningStart: 0.0,
  scene1SweepDelay: 0.25,
  scene2BloomStart: 1.0,
  scene3LogoRevealStart: 2.0,
  scene4BrandRevealStart: 3.0,
  scene5TaglineRevealStart: 4.0,
  exitStartMs: 5050,
  dissolveDurationMs: 650,
  reducedMotionHoldMs: 1100,
  reducedMotionDissolveMs: 250,
} as const;

/**
 * Deterministic floating champagne-gold pollen motes distributed cleanly around
 * the frame so the center focal plane remains serene and unobstructed.
 */
export const GOLD_MOTES: readonly GoldMote[] = [
  { id: 1, xPercent: 14, yPercent: 24, sizePx: 2.5, driftX: 12, driftY: -28, delay: 0.1, duration: 4.2, peakOpacity: 0.55 },
  { id: 2, xPercent: 22, yPercent: 68, sizePx: 2.0, driftX: -10, driftY: -24, delay: 0.35, duration: 4.0, peakOpacity: 0.45 },
  { id: 3, xPercent: 31, yPercent: 18, sizePx: 1.8, driftX: 8, driftY: -20, delay: 0.2, duration: 3.8, peakOpacity: 0.4 },
  { id: 4, xPercent: 76, yPercent: 22, sizePx: 2.4, driftX: -14, driftY: -26, delay: 0.15, duration: 4.4, peakOpacity: 0.55 },
  { id: 5, xPercent: 84, yPercent: 64, sizePx: 2.2, driftX: 10, driftY: -30, delay: 0.4, duration: 4.1, peakOpacity: 0.5 },
  { id: 6, xPercent: 68, yPercent: 78, sizePx: 1.8, driftX: -8, driftY: -22, delay: 0.25, duration: 3.9, peakOpacity: 0.42 },
  { id: 7, xPercent: 18, yPercent: 45, sizePx: 3.0, driftX: 14, driftY: -26, delay: 0.55, duration: 4.0, peakOpacity: 0.6 },
  { id: 8, xPercent: 82, yPercent: 42, sizePx: 2.8, driftX: -12, driftY: -24, delay: 0.5, duration: 4.2, peakOpacity: 0.58 },
  { id: 9, xPercent: 41, yPercent: 84, sizePx: 2.0, driftX: 9, driftY: -18, delay: 0.3, duration: 3.7, peakOpacity: 0.45 },
  { id: 10, xPercent: 60, yPercent: 15, sizePx: 2.0, driftX: -9, driftY: -20, delay: 0.45, duration: 3.9, peakOpacity: 0.44 },
  { id: 11, xPercent: 28, yPercent: 82, sizePx: 2.6, driftX: 11, driftY: -25, delay: 0.6, duration: 4.1, peakOpacity: 0.52 },
  { id: 12, xPercent: 72, yPercent: 32, sizePx: 1.6, driftX: -7, driftY: -19, delay: 0.7, duration: 3.6, peakOpacity: 0.38 },
];
