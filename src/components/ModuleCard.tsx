import React from 'react';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  accentColor: string;
  accentBg: string;
  accentInk: string;
  actionLabel?: string;
  onOpen: () => void;
}

export function ModuleCard({
  title,
  description,
  icon: Icon,
  accentColor,
  accentBg,
  accentInk,
  actionLabel = 'Open module',
  onOpen,
}: ModuleCardProps) {
  return (
    <div className="hhj-card p-5 lg:p-6 flex flex-col justify-between gap-4 hover:border-[var(--border-strong)] transition-all">
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <span
            className="w-[42px] h-[42px] rounded-[12px] grid place-items-center shrink-0"
            style={{ backgroundColor: accentBg, color: accentInk }}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
          </span>
          <span
            className="w-8 h-1 rounded-full shrink-0"
            style={{ backgroundColor: accentColor }}
            aria-hidden="true"
          />
        </div>
        <h3 className="font-display font-bold text-[1.08rem] text-[var(--ink)]">{title}</h3>
        <p className="text-[0.94rem] text-[var(--muted)] leading-relaxed">{description}</p>
      </div>
      <div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--plum)] hover:underline cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-champagne)] rounded"
        >
          <span>{actionLabel}</span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
