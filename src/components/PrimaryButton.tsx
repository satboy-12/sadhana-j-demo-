import React from 'react';
import { Link } from 'react-router-dom';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  to?: string;
  children: React.ReactNode;
}

export function PrimaryButton({
  to,
  children,
  className = '',
  type = 'button',
  ...props
}: PrimaryButtonProps) {
  const baseClass = `primary-button inline-flex items-center justify-center gap-2 min-h-[42px] px-5 py-2.5 text-sm font-bold cursor-pointer disabled:opacity-60 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-champagne)] ${className}`;

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
