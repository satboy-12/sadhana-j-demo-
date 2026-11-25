import React from 'react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  icon?: React.ReactNode;
  trailing?: React.ReactNode;
}

export function FormInput({
  id,
  label,
  error,
  icon,
  trailing,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[0.86rem] font-semibold text-[var(--muted)]">
        {label}
      </label>
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3.5 text-[var(--muted)]">{icon}</span>}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          className={`w-full min-h-[44px] bg-[var(--surface2)] ${icon ? 'pl-10' : 'px-3'} ${
            trailing ? 'pr-12' : 'pr-3.5'
          } py-2 rounded-[10px] text-sm text-[var(--ink)] border focus:outline-2 focus:outline-[var(--plum)] focus:bg-[var(--surface)] transition-colors ${
            error ? 'border-[var(--bad)]' : 'border-[var(--line)]'
          } ${className}`}
          {...props}
        />
        {trailing && <div className="absolute right-3 flex items-center gap-1">{trailing}</div>}
      </div>
      {error && (
        <p className="text-xs font-medium text-[var(--bad)]" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
