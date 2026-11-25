import React from 'react';

export interface EmptyStateProps {
  title: string;
  description: string;
  endpoint?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title,
  description,
  endpoint,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="border-[1.5px] border-dashed border-[var(--border-strong)] rounded-[16px] p-6 text-center text-[var(--muted)] flex flex-col items-center justify-center gap-2.5 bg-[var(--bg-secondary)]/55">
      <div className="w-16 h-16 rounded-[16px] overflow-hidden bg-[var(--surface2)] flex items-center justify-center p-1.5 border border-[var(--border-primary)] shadow-sm">
        <img
          src="/assets/images/empty_state.svg"
          alt="Serene botanical wellness illustration"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="font-display text-base font-bold text-[var(--ink)]">{title}</h3>
        <p className="text-sm text-[var(--muted)]">{description}</p>
        {endpoint && (
          <p className="text-xs text-[var(--muted)] font-mono pt-0.5">{endpoint}</p>
        )}
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 px-4 py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer whitespace-nowrap"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
