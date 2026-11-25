import React, { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import { validateEmail, validatePassword } from '../utils/validation';

export function LoginPage() {
  const { authReady, isAuthenticated, login, loginWithGoogle, sendPasswordReset } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo =
    (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const nextEmailErr = validateEmail(email);
    const nextPassErr = validatePassword(password, 1);
    setEmailError(nextEmailErr);
    setPasswordError(nextPassErr);
    setAuthError(null);
    setResetMessage(null);

    if (nextEmailErr || nextPassErr) {
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: email.trim(), password, rememberMe });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Unable to complete sign in. Please check your credentials.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setResetMessage(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to sign in with Google right now.',
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    const nextEmailErr = validateEmail(email);
    setEmailError(nextEmailErr);
    setAuthError(null);
    setResetMessage(null);
    if (nextEmailErr) {
      setAuthError('Enter your registered email address above to receive a password reset link.');
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setResetMessage(`Password reset email sent to ${email.trim()}.`);
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to send password reset email.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const busy = submitting || googleSubmitting;

  if (authReady && isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="page-container flex flex-col items-center">
        <div className="w-full max-w-[460px] flex flex-col gap-5">
          <Link
            to="/"
            className="inline-flex items-center gap-3 font-display font-bold text-[var(--ink)] self-start focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-champagne)] rounded-xl"
          >
            <BrandLogo variant="symbol" className="w-12 h-12 sm:w-14 sm:h-14" surface="light" />
            <span className="flex flex-col">
              <span className="text-base sm:text-lg leading-tight">Her Health Journey</span>
              <span className="text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[var(--brand-jade)]">
                Know Your Body. Own Your Journey.
              </span>
            </span>
          </Link>

          <div className="hhj-card p-5 sm:p-8 flex flex-col gap-5">
            <div>
              <p className="hhj-eyebrow">Welcome back</p>
              <h1 className="font-display font-bold text-2xl sm:text-[1.75rem] text-[var(--ink)] mt-1">
                Sign in to your journal
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Continue with Google or your email and password to access your Cloud Firestore health vault.
              </p>
            </div>

            {authError && (
              <ErrorState error={authError} expectedEndpoint="Firebase Authentication" />
            )}

            {resetMessage && (
              <p
                role="status"
                className="text-xs font-medium text-[var(--good)] bg-[var(--ovu-soft)] px-3.5 py-2.5 rounded-[12px]"
              >
                {resetMessage}
              </p>
            )}

            <GoogleSignInButton
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
              label={googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
            />

            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-[var(--line)]" />
              <span className="px-3 text-[0.72rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                or sign in with email
              </span>
              <div className="flex-grow border-t border-[var(--line)]" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormInput
                id="login-email"
                label="Email address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError(null);
                }}
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
                error={emailError}
              />

              <FormInput
                id="login-password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError(null);
                }}
                placeholder="Enter your password"
                icon={<Lock className="w-4 h-4" aria-hidden="true" />}
                error={passwordError}
                trailing={
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <Eye className="w-4 h-4" aria-hidden="true" />
                    )}
                  </button>
                }
              />

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-2 text-xs text-[var(--muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded accent-[var(--plum)] cursor-pointer"
                  />
                  <span>Keep me signed in</span>
                </label>

                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void handleForgotPassword()}
                  className="text-xs font-semibold text-[var(--plum)] hover:underline cursor-pointer disabled:opacity-60"
                >
                  Forgot password?
                </button>
              </div>

              <PrimaryButton type="submit" disabled={busy} className="w-full">
                <span>{submitting ? 'Signing in...' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </PrimaryButton>
            </form>

            <div className="pt-4 border-t border-[var(--line)] text-center">
              <p className="text-xs text-[var(--muted)]">
                Don&apos;t have an account?{' '}
                <Link to="/register" className="text-[var(--plum)] font-bold hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
