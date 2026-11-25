import React from 'react';

interface CycleWheelProps {
  averageCycle?: number;
  periodLength?: number;
  ovulationDay?: number;
  currentDay: number | null;
  phaseLabel: string;
  phaseColor?: string;
  smallLabel?: string;
  sizeClass?: string;
}

export function CycleWheel({
  averageCycle = 28,
  periodLength = 5,
  ovulationDay = 14,
  currentDay,
  phaseLabel,
  phaseColor = 'var(--muted)',
  smallLabel = 'Cycle day',
  sizeClass = 'w-[240px] max-w-full',
}: CycleWheelProps) {
  const size = 240;
  const center = size / 2;
  const radius = center - 18;
  const strokeWidth = 16;
  const total = Math.max(20, averageCycle);
  const safePeriod = Math.min(periodLength, total - 8);
  const safeOvu = Math.max(safePeriod + 4, Math.min(ovulationDay, total - 4));

  const segments: Array<{
    color: string;
    start: number;
    end: number;
  }> = [
    { color: 'var(--c-men)', start: 1, end: safePeriod },
    { color: 'var(--c-fol)', start: safePeriod + 1, end: safeOvu - 2 },
    { color: 'var(--c-ovu)', start: safeOvu - 1, end: safeOvu + 1 },
    { color: 'var(--c-lut)', start: safeOvu + 2, end: total },
  ];

  const pointAt = (angleDeg: number): [number, number] => [
    center + radius * Math.sin((angleDeg * Math.PI) / 180),
    center - radius * Math.cos((angleDeg * Math.PI) / 180),
  ];

  let indicator: [number, number] | null = null;
  if (currentDay != null && currentDay >= 1) {
    const clampedDay = Math.min(currentDay, total);
    const angle = ((clampedDay - 0.5) / total) * 360;
    indicator = pointAt(angle);
  }

  return (
    <div className={`relative aspect-square shrink-0 ${sizeClass}`}>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full h-full block overflow-visible"
        role="img"
        aria-label={`Cycle wheel showing menstrual, follicular, ovulation, and luteal phases. ${smallLabel} ${
          currentDay != null ? currentDay : 'none'
        }, ${phaseLabel}`}
      >
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--surface2)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, idx) => {
          const a0 = ((seg.start - 1) / total) * 360 + 1.6;
          const a1 = (seg.end / total) * 360 - 1.6;
          if (a1 <= a0) return null;
          const p0 = pointAt(a0);
          const p1 = pointAt(a1);
          const largeArc = a1 - a0 > 180 ? 1 : 0;
          const d = `M${p0[0].toFixed(2)} ${p0[1].toFixed(2)}A${radius} ${radius} 0 ${largeArc} 1 ${p1[0].toFixed(2)} ${p1[1].toFixed(2)}`;
          return (
            <path
              key={idx}
              d={d}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
            />
          );
        })}
        {indicator && (
          <circle
            cx={indicator[0].toFixed(2)}
            cy={indicator[1].toFixed(2)}
            r="11"
            fill="var(--surface)"
            stroke="var(--ink)"
            strokeWidth="3.5"
          />
        )}

        <text
          x={center}
          y={center - 30}
          textAnchor="middle"
          fill="var(--muted)"
          fontSize="12"
          fontWeight="700"
          letterSpacing="1.6"
          style={{ textTransform: 'uppercase' }}
        >
          {smallLabel}
        </text>
        <text
          x={center}
          y={center + 20}
          textAnchor="middle"
          fill="var(--ink)"
          fontSize="56"
          fontWeight="700"
          className="font-display tabular-nums"
        >
          {currentDay != null ? currentDay : '–'}
        </text>
        <text
          x={center}
          y={center + 46}
          textAnchor="middle"
          fill={phaseColor}
          fontSize="15"
          fontWeight="700"
        >
          {phaseLabel}
        </text>
      </svg>
    </div>
  );
}
