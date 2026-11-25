import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const raw = error instanceof Error ? error.message : String(error);
    let friendly = raw;
    try {
      const parsed = JSON.parse(raw) as { error?: string; operationType?: string; path?: string };
      if (parsed && parsed.error) {
        friendly = `Database ${parsed.operationType || 'operation'} failed${
          parsed.path ? ` (${parsed.path})` : ''
        }: ${parsed.error}`;
      }
    } catch {
      // keep raw message
    }
    return { hasError: true, message: friendly };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex items-center justify-center p-6">
          <div className="hhj-card max-w-md w-full p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 text-[var(--bad)]">
              <AlertTriangle className="w-6 h-6 shrink-0" aria-hidden="true" />
              <h1 className="font-display font-bold text-lg text-[var(--ink)]">
                Something went wrong
              </h1>
            </div>
            <p className="text-sm text-[var(--muted)] leading-relaxed break-words">
              {this.state.message || 'An unexpected application error occurred.'}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, message: '' });
                window.location.assign('/');
              }}
              className="hhj-btn-primary inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-[12px] text-sm font-semibold cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>Return to home</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
