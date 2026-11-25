import React from 'react';

interface ProgressIndicatorProps {
  value: number;
  max?: number;
  accentColor?: string;
  label?: string;
  heightClass?: string;
}

export function ProgressIndicator({
  value,
  max = 100,
  accentColor = 'var(--brand-emerald)',
  label,
  heightClass = 'h-2.5',
}: ProgressIndicatorProps) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.max(0, Math.min(100, Math.round((value / safeMax) * 100)));

  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={safeMax}
      aria-valuenow={Math.round(value)}
      className={`${heightClass} w-full rounded-full bg-[var(--surface2)] overflow-hidden`}
    >
      <div
        className="h-full rounded-full transition-all duration-300"
        style={{ width: `${pct}%`, backgroundColor: accentColor }}
      />
    </div>
  );
}
