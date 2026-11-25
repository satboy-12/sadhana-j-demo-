import React from 'react';
import type { MoodOption } from '../types/api';

const MOUTH_PATHS: Record<MoodOption, string> = {
  Radiant: 'M8 13.5c1 2.8 7 2.8 8 0',
  Calm: 'M8.5 14.5c1.2 1.3 5.8 1.3 7 0',
  Fatigued: 'M9 15h6',
  Anxious: 'M8.5 16c1-1.5 6-1.5 7 0',
  Low: 'M8.5 17c1-2.8 6-2.8 7 0',
};

export function MoodFaceSvg({
  mood,
  className = 'w-8 h-8',
}: {
  mood: MoodOption | string;
  className?: string;
}) {
  const key = (mood in MOUTH_PATHS ? mood : 'Calm') as MoodOption;
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9.5" />
      <path d="M9 9.5h.01M15 9.5h.01" strokeWidth="2.6" />
      <path d={MOUTH_PATHS[key]} />
    </svg>
  );
}
