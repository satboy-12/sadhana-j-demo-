import React from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';
import { ApiError } from '../api/client';
import { formatClientError } from '../utils/errorDisplay';

interface ApiIntegrationBannerProps {
  error: ApiError | string | null;
  expectedEndpoint?: string;
  onRetry?: () => void;
  retrying?: boolean;
}

export function ApiIntegrationBanner({
  error,
  expectedEndpoint,
  onRetry,
  retrying = false,
}: ApiIntegrationBannerProps) {
  if (!error) return null;

  const isApiError = error instanceof ApiError;
  const isDisconnected = isApiError && error.code === 'BACKEND_UNAVAILABLE';
  const normalized = formatClientError(error, 'Database request failed.');
  const message = typeof normalized === 'string' ? normalized : normalized.message;

  return (
    <div
      role="status"
      className={`rounded-[14px] px-4 py-3.5 border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isDisconnected
          ? 'bg-[var(--warn-soft)] border-[var(--warn)]/25 text-[var(--ink)]'
          : 'bg-[var(--bad-soft)] border-[var(--bad)]/25 text-[var(--ink)]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${
            isDisconnected
              ? 'bg-[var(--surface)] text-[var(--warn)]'
              : 'bg-[var(--surface)] text-[var(--bad)]'
          }`}
        >
          {isDisconnected ? (
            <WifiOff className="w-4 h-4" aria-hidden="true" />
          ) : (
            <AlertCircle className="w-4 h-4" aria-hidden="true" />
          )}
        </div>
        <div className="space-y-0.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            <span className={isDisconnected ? 'text-[var(--warn)]' : 'text-[var(--bad)]'}>
              {isDisconnected
                ? 'Cloud Firestore Unavailable'
                : 'Database Sync Error'}
            </span>
            {expectedEndpoint && (
              <>
                <span aria-hidden="true" className="hidden sm:inline text-[var(--muted)]">
                  ·
                </span>
                <span className="font-mono text-xs px-1.5 py-0.5 rounded bg-[var(--surface)]/75 text-[var(--plum)]">
                  {expectedEndpoint}
                </span>
              </>
            )}
          </div>
          <p className="text-[0.9rem] text-[var(--ink)] leading-snug">{message}</p>
          {isDisconnected && (
            <p className="text-xs text-[var(--muted)]">
              Check your network connection or verify your Cloud Firestore configuration.
            </p>
          )}
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          disabled={retrying}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${retrying ? 'animate-spin' : ''}`} aria-hidden="true" />
          {retrying ? 'Checking...' : 'Retry Sync'}
        </button>
      )}
    </div>
  );
}
