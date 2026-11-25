import React from 'react';
import { motion } from 'motion/react';
import { EMERALD_BLOOM_TIMELINE } from '../utils/cinematicSequence';

interface EmeraldBloomBotanicalsProps {
  reducedMotion: boolean;
}

const EASE_BOTANICAL = [0.22, 1, 0.36, 1] as const;

/**
 * Original layered botanical foliage anchored cleanly along the viewport edges
 * so the central crest and editorial typography breathe without obstruction.
 * Animates solely via GPU-composited transforms (rotate, scale, translate) and opacity.
 */
export function EmeraldBloomBotanicals({ reducedMotion }: EmeraldBloomBotanicalsProps) {
  const bloomDelay = reducedMotion ? 0 : EMERALD_BLOOM_TIMELINE.scene2BloomStart;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden select-none"
    >
      {/* Top-Left Background Depth Sprig (Parallax Layer 1) */}
      <motion.svg
        viewBox="0 0 340 320"
        className="absolute -top-8 -left-10 w-[44vw] max-w-[330px] min-w-[165px] h-auto opacity-85"
        style={{ transformOrigin: '10% 10%' }}
        initial={
          reducedMotion
            ? { opacity: 0.75, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0, scale: 0.72, rotate: -14, x: -18, y: -14 }
        }
        animate={
          reducedMotion
            ? { opacity: 0.75, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0.85, scale: 1, rotate: 0, x: 6, y: 4 }
        }
        transition={{
          delay: bloomDelay,
          duration: reducedMotion ? 0.1 : 1.35,
          ease: EASE_BOTANICAL,
        }}
        fill="none"
      >
        {/* Main arching stem */}
        <path
          d="M12 10 C82 48, 148 118, 224 218"
          stroke="#C5A66B"
          strokeOpacity="0.48"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        {/* Leaf 1 */}
        <path
          d="M52 38 C98 22, 144 38, 152 84 C112 96, 68 78, 52 38 Z"
          fill="#174F40"
          fillOpacity="0.88"
        />
        <path
          d="M54 40 C94 52, 122 66, 148 82"
          stroke="#E4D2A5"
          strokeOpacity="0.45"
          strokeWidth="1"
        />
        {/* Leaf 2 */}
        <path
          d="M94 82 C64 128, 72 178, 114 198 C140 162, 134 114, 94 82 Z"
          fill="#216B54"
          fillOpacity="0.72"
        />
        <path
          d="M95 84 C102 128, 108 160, 113 194"
          stroke="#C5A66B"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        {/* Leaf 3 */}
        <path
          d="M138 116 C188 94, 240 112, 256 158 C210 174, 158 158, 138 116 Z"
          fill="#103C32"
          stroke="#C5A66B"
          strokeOpacity="0.32"
          strokeWidth="1"
        />
        {/* Tip bud leaf */}
        <path
          d="M188 172 C222 178, 246 206, 238 240 C206 230, 184 204, 188 172 Z"
          fill="#216B54"
          fillOpacity="0.78"
        />
        <path
          d="M190 175 C212 198, 224 216, 236 236"
          stroke="#E4D2A5"
          strokeOpacity="0.52"
          strokeWidth="0.95"
        />
      </motion.svg>

      {/* Bottom-Left Foreground Botanical Cluster (Parallax Layer 2) */}
      <motion.svg
        viewBox="0 0 380 340"
        className="absolute -bottom-10 -left-10 w-[50vw] max-w-[380px] min-w-[190px] h-auto"
        style={{ transformOrigin: '10% 92%' }}
        initial={
          reducedMotion
            ? { opacity: 0.92, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0, scale: 0.68, rotate: 12, x: -24, y: 22 }
        }
        animate={
          reducedMotion
            ? { opacity: 0.92, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0.95, scale: 1, rotate: 0, x: 8, y: -6 }
        }
        transition={{
          delay: bloomDelay + (reducedMotion ? 0 : 0.12),
          duration: reducedMotion ? 0.1 : 1.45,
          ease: EASE_BOTANICAL,
        }}
        fill="none"
      >
        <path
          d="M18 326 C64 252, 136 174, 244 102"
          stroke="#C5A66B"
          strokeOpacity="0.52"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Deep silhouette leaf */}
        <path
          d="M48 286 C26 226, 54 166, 108 148 C126 200, 104 260, 48 286 Z"
          fill="#103C32"
          stroke="#C5A66B"
          strokeOpacity="0.34"
          strokeWidth="1"
        />
        {/* Golden-veined sage emerald leaf */}
        <path
          d="M96 234 C156 244, 214 216, 232 168 C178 152, 118 178, 96 234 Z"
          fill="#174F40"
          fillOpacity="0.94"
        />
        <path
          d="M98 232 C152 210, 192 192, 228 170"
          stroke="#E4D2A5"
          strokeOpacity="0.55"
          strokeWidth="1.1"
        />
        {/* Upper unfolding petal leaf */}
        <path
          d="M148 172 C138 118, 174 72, 224 62 C232 112, 198 158, 148 172 Z"
          fill="#216B54"
          fillOpacity="0.82"
        />
        <path
          d="M150 170 C178 134, 198 102, 221 66"
          stroke="#E4D2A5"
          strokeOpacity="0.5"
          strokeWidth="1"
        />
        {/* Delicate gold accent leaf */}
        <path
          d="M198 134 C242 138, 282 116, 294 82 C254 74, 214 96, 198 134 Z"
          fill="#174F40"
          stroke="#E4D2A5"
          strokeOpacity="0.48"
          strokeWidth="1.05"
        />
      </motion.svg>

      {/* Top-Right Botanical Canopy (Parallax Layer 2) */}
      <motion.svg
        viewBox="0 0 380 330"
        className="absolute -top-10 -right-10 w-[48vw] max-w-[370px] min-w-[185px] h-auto"
        style={{ transformOrigin: '90% 10%' }}
        initial={
          reducedMotion
            ? { opacity: 0.9, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0, scale: 0.7, rotate: 14, x: 22, y: -18 }
        }
        animate={
          reducedMotion
            ? { opacity: 0.9, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0.92, scale: 1, rotate: 0, x: -6, y: 6 }
        }
        transition={{
          delay: bloomDelay + (reducedMotion ? 0 : 0.08),
          duration: reducedMotion ? 0.1 : 1.4,
          ease: EASE_BOTANICAL,
        }}
        fill="none"
      >
        <path
          d="M362 18 C294 74, 226 146, 144 236"
          stroke="#C5A66B"
          strokeOpacity="0.5"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M312 58 C258 34, 200 46, 178 96 C228 118, 288 104, 312 58 Z"
          fill="#174F40"
          fillOpacity="0.92"
        />
        <path
          d="M308 60 C262 72, 224 84, 182 95"
          stroke="#E4D2A5"
          strokeOpacity="0.52"
          strokeWidth="1.05"
        />
        <path
          d="M276 106 C306 160, 290 218, 240 238 C210 192, 224 134, 276 106 Z"
          fill="#216B54"
          fillOpacity="0.78"
        />
        <path
          d="M274 110 C264 156, 254 192, 241 234"
          stroke="#C5A66B"
          strokeOpacity="0.46"
          strokeWidth="1"
        />
        <path
          d="M214 162 C164 148, 114 172, 102 220 C148 234, 198 210, 214 162 Z"
          fill="#103C32"
          stroke="#C5A66B"
          strokeOpacity="0.38"
          strokeWidth="1"
        />
      </motion.svg>

      {/* Bottom-Right Subtle Gold-Tipped Frond (Parallax Layer 1) */}
      <motion.svg
        viewBox="0 0 340 320"
        className="absolute -bottom-8 -right-10 w-[44vw] max-w-[330px] min-w-[165px] h-auto"
        style={{ transformOrigin: '90% 90%' }}
        initial={
          reducedMotion
            ? { opacity: 0.8, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0, scale: 0.72, rotate: -12, x: 18, y: 18 }
        }
        animate={
          reducedMotion
            ? { opacity: 0.8, scale: 1, rotate: 0, x: 0, y: 0 }
            : { opacity: 0.84, scale: 1, rotate: 0, x: -6, y: -4 }
        }
        transition={{
          delay: bloomDelay + (reducedMotion ? 0 : 0.18),
          duration: reducedMotion ? 0.1 : 1.35,
          ease: EASE_BOTANICAL,
        }}
        fill="none"
      >
        <path
          d="M326 306 C264 252, 200 186, 126 112"
          stroke="#C5A66B"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
        <path
          d="M276 260 C216 274, 162 248, 148 198 C202 184, 256 208, 276 260 Z"
          fill="#174F40"
          fillOpacity="0.88"
        />
        <path
          d="M272 257 C224 236, 186 218, 152 200"
          stroke="#E4D2A5"
          strokeOpacity="0.48"
          strokeWidth="1"
        />
        <path
          d="M236 208 C252 152, 224 100, 174 84 C156 134, 182 188, 236 208 Z"
          fill="#216B54"
          fillOpacity="0.74"
        />
        <path
          d="M174 158 C134 156, 98 134, 92 98 C128 96, 162 118, 174 158 Z"
          fill="#103C32"
          stroke="#E4D2A5"
          strokeOpacity="0.42"
          strokeWidth="1"
        />
      </motion.svg>
    </div>
  );
}
