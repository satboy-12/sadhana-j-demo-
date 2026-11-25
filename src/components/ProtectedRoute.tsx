import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { MailCheck, RefreshCw, LogOut } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { PrimaryButton } from './PrimaryButton';
import { SecondaryButton } from './SecondaryButton';
import { LoadingSkeleton } from './LoadingSkeleton';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const {
    user,
    authReady,
    isAuthenticated,
    emailVerified,
    resendVerificationEmail,
    refreshAuthUser,
    logout,
  } = useAuth();
  const location = useLocation();
  const [busy, setBusy] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!authReady || !isAuthenticated || emailVerified) return;
    const handleTabReturn = () => {
      if (document.visibilityState === 'visible') {
        void refreshAuthUser().catch(() => {});
      }
    };
    window.addEventListener('focus', handleTabReturn);
    document.addEventListener('visibilitychange', handleTabReturn);
    return () => {
      window.removeEventListener('focus', handleTabReturn);
      document.removeEventListener('visibilitychange', handleTabReturn);
    };
  }, [authReady, isAuthenticated, emailVerified, refreshAuthUser]);

  if (!authReady) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-8 max-w-4xl mx-auto">
        <LoadingSkeleton rows={4} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (!emailVerified) {
    const handleCheckVerification = async () => {
      setBusy(true);
      setErrorMessage(null);
      setStatusMessage(null);
      try {
        const verified = await refreshAuthUser();
        if (!verified) {
          setStatusMessage(
            'Your email is not verified yet. Please click the verification link in your inbox, then check again.',
          );
        }
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : 'Unable to refresh verification status.',
        );
      } finally {
        setBusy(false);
      }
    };

    const handleResend = async () => {
      setBusy(true);
      setErrorMessage(null);
      setStatusMessage(null);
      try {
        await resendVerificationEmail();
        setStatusMessage(`Verification email sent to ${user?.email}.`);
      } catch (err) {
        setErrorMessage(err instanceof Error ? err.message : 'Unable to resend email.');
      } finally {
        setBusy(false);
      }
    };

    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center py-10">
        <div className="page-container flex flex-col items-center">
          <div className="w-full max-w-[480px] hhj-card p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              <BrandLogo variant="symbol" surface="bare" className="w-12 h-12" />
              <div>
                <p className="hhj-eyebrow">Security Verification</p>
                <h1 className="font-display font-bold text-xl text-[var(--ink)]">
                  Verify your email address
                </h1>
              </div>
            </div>

            <p className="text-sm text-[var(--muted)] leading-relaxed">
              To protect your private Cloud Firestore health vault, please verify{' '}
              <strong className="text-[var(--ink)]">{user?.email}</strong> using the link sent to
              your inbox (check your spam or promotions folder if needed).
            </p>

            {statusMessage && (
              <p
                role="status"
                className="text-xs font-medium text-[var(--good)] bg-[var(--ovu-soft)] px-3.5 py-2.5 rounded-[12px]"
              >
                {statusMessage}
              </p>
            )}

            {errorMessage && (
              <p
                role="alert"
                className="text-xs font-medium text-[var(--bad)] bg-[var(--bad-soft)] px-3.5 py-2.5 rounded-[12px]"
              >
                {errorMessage}
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              <PrimaryButton
                type="button"
                disabled={busy}
                onClick={() => void handleCheckVerification()}
                className="w-full"
              >
                <MailCheck className="w-4 h-4" aria-hidden="true" />
                <span>{busy ? 'Checking...' : "I've verified my email"}</span>
              </PrimaryButton>

              <SecondaryButton
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => void handleResend()}
                className="w-full"
              >
                <RefreshCw className="w-4 h-4" aria-hidden="true" />
                <span>Resend verification email</span>
              </SecondaryButton>

              <button
                type="button"
                disabled={busy}
                onClick={() => void logout()}
                className="inline-flex items-center justify-center gap-2 min-h-[40px] text-xs font-semibold text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer mt-1"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Sign out and switch account</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
