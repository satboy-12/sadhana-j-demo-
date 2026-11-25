import React from 'react';
import { Link } from 'react-router-dom';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  variant?: 'gold' | 'outline';
  children: React.ReactNode;
}

export function SecondaryButton({
  to,
  variant = 'outline',
  children,
  className = '',
  type = 'button',
  ...props
}: SecondaryButtonProps) {
  const variantClass =
    variant === 'gold'
      ? 'secondary-button'
      : 'rounded-[12px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] font-semibold';

  const baseClass = `${variantClass} inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 text-sm transition-colors cursor-pointer disabled:opacity-60 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-champagne)] ${className}`;

  if (to) {
    return (
      <Link to={to} className={baseClass}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={baseClass} {...props}>
      {children}
    </button>
  );
}
