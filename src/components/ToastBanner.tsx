import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastBannerProps {
  message: string | null;
  variant?: 'success' | 'error';
  onDismiss: () => void;
}

export function ToastBanner({
  message,
  variant = 'success',
  onDismiss,
}: ToastBannerProps) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, 3200);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed left-1/2 -translate-x-1/2 bottom-20 lg:bottom-6 z-60 max-w-[calc(100vw-32px)] sm:max-w-md bg-[var(--ink)] text-[var(--bg)] px-4 py-2.5 rounded-[12px] shadow-xl flex items-center gap-3 font-semibold text-sm"
    >
      {variant === 'success' ? (
        <CheckCircle2 className="w-4 h-4 text-[var(--good)] shrink-0" aria-hidden="true" />
      ) : (
        <AlertCircle className="w-4 h-4 text-[var(--bad)] shrink-0" aria-hidden="true" />
      )}
      <span className="flex-1">{message}</span>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss notification"
        className="p-1 rounded hover:opacity-75 cursor-pointer"
      >
        <X className="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  );
}
