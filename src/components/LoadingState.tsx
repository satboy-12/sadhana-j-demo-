import React from 'react';

export function LoadingState({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Loading content">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-28 rounded-[18px] bg-[var(--surface2)]" />
        <div className="h-28 rounded-[18px] bg-[var(--surface2)]" />
        <div className="h-28 rounded-[18px] bg-[var(--surface2)]" />
      </div>
      <div className="hhj-card p-6 space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="h-12 rounded-[10px] bg-[var(--surface2)]" />
        ))}
      </div>
    </div>
  );
}
