import React from 'react';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function SectionHeader({ eyebrow, title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="hhj-eyebrow">{eyebrow}</p>}
        <h1 className="font-display font-bold text-[clamp(1.8rem,4vw,2.4rem)] text-[var(--ink)] mt-1">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm text-[var(--muted)] mt-1 max-w-[60ch] leading-relaxed">{subtitle}</p>
        )}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2.5">{action}</div>}
    </div>
  );
}
