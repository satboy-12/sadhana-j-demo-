import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  accentColor?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}

export function DashboardCard({
  title,
  subtitle,
  icon,
  accentColor,
  action,
  className = '',
  children,
}: DashboardCardProps) {
  return (
    <section className={`hhj-card p-4 sm:p-5 lg:p-[22px] ${className}`}>
      {(title || icon || action) && (
        <header className="flex items-start justify-between gap-3 mb-3.5">
          <div className="min-w-0">
            {title && (
              <h2 className="font-display font-bold text-[1.15rem] sm:text-[1.22rem] text-[var(--ink)] flex items-center gap-2">
                {accentColor && (
                  <span
                    className="w-2.5 h-2.5 rounded-sm shrink-0"
                    style={{ backgroundColor: accentColor }}
                    aria-hidden="true"
                  />
                )}
                <span>{title}</span>
              </h2>
            )}
            {subtitle && <p className="text-xs sm:text-sm text-[var(--muted)] mt-0.5">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {action}
            {icon}
          </div>
        </header>
      )}
      {children}
    </section>
  );
}
