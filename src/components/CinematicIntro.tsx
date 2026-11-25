import React, { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { BrandLogo } from './BrandLogo';
import { EmeraldBloomBotanicals } from './EmeraldBloomBotanicals';
import { EMERALD_BLOOM_TIMELINE, GOLD_MOTES } from '../utils/cinematicSequence';

interface CinematicIntroProps {
  onComplete: () => void;
}

const EASE_CINEMATIC = [0.22, 1, 0.36, 1] as const;

/**
 * THE EMERALD BLOOM — A JOURNEY BEGINS.
 *
 * 5-Scene Luxury Cinematic Opening (~5 seconds, automatic completion):
 * Scene 1 (0–1s):   The Awakening — deep emerald gradient, floating gold motes, champagne-gold beam.
 * Scene 2 (1–2s):   Emerald Bloom — layered botanical leaves unfold smoothly from the edges.
 * Scene 3 (2–3s):   The Logo Reveal — official HER HEALTH JOURNEY crest illuminated by a circular golden light sweep.
 * Scene 4 (3–4s):   Brand Reveal — HER HEALTH JOURNEY in refined editorial typography with champagne-gold accents.
 * Scene 5 (4–5s):   Tagline Reveal — KNOW YOUR BODY. / OWN YOUR JOURNEY., followed by seamless dissolve to homepage.
 */
export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const prefersReducedMotion = Boolean(useReducedMotion());
  const [exiting, setExiting] = useState(false);

  // Automatically transition after Scene 5 (~5s) or calm hold under reduced motion
  useEffect(() => {
    const holdDuration = prefersReducedMotion
      ? EMERALD_BLOOM_TIMELINE.reducedMotionHoldMs
      : EMERALD_BLOOM_TIMELINE.exitStartMs;

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
    }, holdDuration);

    return () => window.clearTimeout(exitTimer);
  }, [prefersReducedMotion]);

  // Invoke onComplete once the final dissolve finishes
  useEffect(() => {
    if (!exiting) return;
    const dissolveMs = prefersReducedMotion
      ? EMERALD_BLOOM_TIMELINE.reducedMotionDissolveMs
      : EMERALD_BLOOM_TIMELINE.dissolveDurationMs;

    const doneTimer = window.setTimeout(() => {
      onComplete();
    }, dissolveMs);

    return () => window.clearTimeout(doneTimer);
  }, [exiting, onComplete, prefersReducedMotion]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Her Health Journey — The Emerald Bloom brand introduction"
      data-testid="cinematic-intro"
      initial={{ opacity: prefersReducedMotion ? 1 : 0 }}
      animate={{
        opacity: exiting ? 0 : 1,
        scale: exiting && !prefersReducedMotion ? 1.018 : 1,
      }}
      transition={{
        duration: exiting
          ? prefersReducedMotion
            ? EMERALD_BLOOM_TIMELINE.reducedMotionDissolveMs / 1000
            : EMERALD_BLOOM_TIMELINE.dissolveDurationMs / 1000
          : 0.75,
        ease: EASE_CINEMATIC,
      }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden select-none"
      style={{
        background: 'linear-gradient(155deg, #092820 0%, #103C32 48%, #092820 100%)',
        color: '#F8F5EB',
      }}
    >
      {/* Scene 1 (0–1s): Deep emerald radial lighting & subtle breathing depth */}
      <motion.div
        aria-hidden="true"
        initial={{ opacity: prefersReducedMotion ? 1 : 0, scale: prefersReducedMotion ? 1 : 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: prefersReducedMotion ? 0.1 : 1.0, ease: 'easeOut' }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(56% 48% at 50% 44%, rgba(33, 107, 84, 0.34) 0%, rgba(23, 79, 64, 0.24) 40%, rgba(16, 60, 50, 0.12) 68%, rgba(9, 40, 32, 0.94) 100%)',
        }}
      />

      {/* Scene 1 (0–1s): Soft champagne-gold light passing across the screen */}
      {!prefersReducedMotion && (
        <motion.div
          aria-hidden="true"
          initial={{ x: '-115%', opacity: 0 }}
          animate={{ x: '135%', opacity: [0, 0.7, 0.45, 0] }}
          transition={{
            delay: EMERALD_BLOOM_TIMELINE.scene1SweepDelay,
            duration: 1.45,
            ease: EASE_CINEMATIC,
          }}
          className="pointer-events-none absolute inset-y-0 w-[42vw] -skew-x-12"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(197, 166, 107, 0.08) 32%, rgba(228, 210, 165, 0.22) 50%, rgba(197, 166, 107, 0.08) 68%, transparent 100%)',
          }}
        />
      )}

      {/* Scene 1 (0–1s+): Subtle floating champagne-gold particles */}
      {!prefersReducedMotion && (
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {GOLD_MOTES.map((mote) => (
            <motion.span
              key={mote.id}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.7 }}
              animate={{
                opacity: [0, mote.peakOpacity, mote.peakOpacity * 0.7, 0],
                x: [0, mote.driftX * 0.5, mote.driftX],
                y: [0, mote.driftY * 0.55, mote.driftY],
                scale: [0.7, 1, 0.85],
              }}
              transition={{
                delay: mote.delay,
                duration: mote.duration,
                ease: 'easeInOut',
              }}
              className="absolute rounded-full"
              style={{
                left: `${mote.xPercent}%`,
                top: `${mote.yPercent}%`,
                width: `${mote.sizePx}px`,
                height: `${mote.sizePx}px`,
                backgroundColor: '#E4D2A5',
                boxShadow: '0 0 8px rgba(197, 166, 107, 0.45)',
              }}
            />
          ))}
        </div>
      )}

      {/* Scene 2 (1–2s): Edge-anchored botanical foliage unfolding naturally */}
      <EmeraldBloomBotanicals reducedMotion={prefersReducedMotion} />

      {/* Center Focal Plane: Scenes 3, 4, and 5 */}
      <div className="relative z-10 page-container flex flex-col items-center text-center px-4">
        <div className="w-full max-w-2xl flex flex-col items-center">
          {/* Scene 3 (2–3s): Official Logo Reveal with delicate circular golden light sweep */}
          <div className="relative flex items-center justify-center mb-7 sm:mb-9">
            {/* Delicate circular golden halo & sweeping arc framing the crest */}
            <motion.svg
              aria-hidden="true"
              viewBox="0 0 320 320"
              className="pointer-events-none absolute w-[184px] sm:w-[244px] h-auto"
              initial={
                prefersReducedMotion
                  ? { opacity: 0.62, rotate: 0, scale: 1 }
                  : { opacity: 0, rotate: -85, scale: 0.84 }
              }
              animate={
                prefersReducedMotion
                  ? { opacity: 0.62, rotate: 0, scale: 1 }
                  : { opacity: [0, 0.95, 0.62], rotate: 55, scale: [0.84, 1.03, 1] }
              }
              transition={{
                delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene3LogoRevealStart,
                duration: prefersReducedMotion ? 0.1 : 1.4,
                ease: EASE_CINEMATIC,
              }}
              fill="none"
            >
              <defs>
                <linearGradient id="emeraldBloomGoldArc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#E4D2A5" stopOpacity="0" />
                  <stop offset="35%" stopColor="#E4D2A5" stopOpacity="0.96" />
                  <stop offset="72%" stopColor="#C5A66B" stopOpacity="0.58" />
                  <stop offset="100%" stopColor="#C5A66B" stopOpacity="0" />
                </linearGradient>
              </defs>
              <circle
                cx="160"
                cy="160"
                r="148"
                stroke="#C5A66B"
                strokeOpacity="0.28"
                strokeWidth="1.05"
              />
              <circle
                cx="160"
                cy="160"
                r="148"
                stroke="url(#emeraldBloomGoldArc)"
                strokeWidth="2.1"
                strokeDasharray="280 660"
                strokeLinecap="round"
              />
            </motion.svg>

            {/* Soft warm radial aura behind crest */}
            <motion.div
              aria-hidden="true"
              initial={prefersReducedMotion ? { opacity: 0.45, scale: 1 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: [0, 0.58, 0.36], scale: 1 }}
              transition={{
                delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene3LogoRevealStart,
                duration: prefersReducedMotion ? 0.1 : 1.15,
                ease: EASE_CINEMATIC,
              }}
              className="pointer-events-none absolute w-[180px] sm:w-[230px] h-[180px] sm:h-[230px] rounded-full blur-2xl"
              style={{
                background:
                  'radial-gradient(circle, rgba(228, 210, 165, 0.28) 0%, rgba(197, 166, 107, 0.1) 55%, transparent 100%)',
              }}
            />

            {/* Crisp Official HER HEALTH JOURNEY Emblem */}
            <motion.div
              initial={
                prefersReducedMotion
                  ? { opacity: 1, scale: 1, y: 0 }
                  : { opacity: 0, scale: 0.9, y: 10 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene3LogoRevealStart + 0.08,
                duration: prefersReducedMotion ? 0.1 : 0.95,
                ease: EASE_CINEMATIC,
              }}
            >
              <BrandLogo
                variant="symbol"
                className="w-[112px] h-[112px] sm:w-[152px] sm:h-[152px]"
                surface="bare"
                alt="Her Health Journey Official Emblem"
              />
            </motion.div>
          </div>

          {/* Scene 4 (3–4s): HER HEALTH JOURNEY Editorial Brand Reveal */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 14 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene4BrandRevealStart,
              duration: prefersReducedMotion ? 0.1 : 0.85,
              ease: EASE_CINEMATIC,
            }}
            className="flex flex-col items-center"
          >
            <h1
              className="font-bold text-[clamp(1.22rem,4.9vw,2.75rem)] tracking-[0.16em] sm:tracking-[0.18em] text-[#FFFFFF] uppercase leading-tight whitespace-nowrap"
              style={{ fontFamily: '"Cormorant Garamond", Georgia, serif' }}
            >
              HER{' '}
              <span className="text-[#E4D2A5]">HEALTH</span>{' '}
              JOURNEY
            </h1>

            {/* Champagne-gold hairline divider */}
            <motion.div
              aria-hidden="true"
              initial={prefersReducedMotion ? { scaleX: 1, opacity: 1 } : { scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{
                delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene4BrandRevealStart + 0.25,
                duration: prefersReducedMotion ? 0.1 : 0.65,
                ease: EASE_CINEMATIC,
              }}
              className="w-36 sm:w-48 h-[1px] my-3.5 sm:my-4 origin-center"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, #C5A66B 28%, #E4D2A5 50%, #C5A66B 72%, transparent 100%)',
              }}
            />
          </motion.div>

          {/* Scene 5 (4–5s): Emotional Two-Line Tagline Reveal */}
          <motion.div
            initial={
              prefersReducedMotion
                ? { opacity: 1, y: 0 }
                : { opacity: 0, y: 10 }
            }
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: prefersReducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene5TaglineRevealStart,
              duration: prefersReducedMotion ? 0.1 : 0.8,
              ease: EASE_CINEMATIC,
            }}
            className="flex flex-col items-center gap-1"
          >
            <p className="text-xs sm:text-[0.95rem] font-medium tracking-[0.22em] uppercase text-[#F8F5EB]">
              KNOW YOUR BODY.
            </p>
            <p className="text-xs sm:text-[0.95rem] font-semibold tracking-[0.22em] uppercase text-[#E4D2A5]">
              OWN YOUR JOURNEY.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
