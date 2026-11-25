import React, { useMemo, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
} from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import { ErrorState } from '../components/ErrorState';
import { FormInput } from '../components/FormInput';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { PrimaryButton } from '../components/PrimaryButton';
import { useAuth } from '../context/AuthContext';
import {
  evaluatePasswordStrength,
  validateRegistrationForm,
} from '../utils/validation';

export function RegisterPage() {
  const { authReady, isAuthenticated, register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const strength = useMemo(() => evaluatePasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const passwordsMismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateRegistrationForm({
      fullName,
      email,
      password,
      confirmPassword,
      acceptedPrivacy,
    });
    setErrors(validationErrors);
    setAuthError(null);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setAuthError(
        err instanceof Error
          ? err.message
          : 'Unable to complete registration. Please check your connection.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to continue with Google right now.',
      );
    } finally {
      setGoogleSubmitting(false);
    }
  };

  const busy = submitting || googleSubmitting;

  if (authReady && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col items-center justify-center py-8 sm:py-12">
      <div className="page-container flex flex-col items-center">
        <div className="w-full max-w-[500px] flex flex-col gap-5">
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
              <p className="hhj-eyebrow">Quick setup</p>
              <h1 className="font-display font-bold text-2xl sm:text-[1.75rem] text-[var(--ink)] mt-1">
                Create your health account
              </h1>
              <p className="text-sm text-[var(--muted)] mt-1">
                Continue with Google or register with email and password to sync your wellness records in Cloud Firestore.
              </p>
            </div>

            {authError && (
              <ErrorState error={authError} expectedEndpoint="Firebase Authentication" />
            )}

            <GoogleSignInButton
              onClick={() => void handleGoogleSignIn()}
              disabled={busy}
              label={googleSubmitting ? 'Connecting to Google...' : 'Continue with Google'}
            />

            <div className="relative flex items-center py-0.5">
              <div className="flex-grow border-t border-[var(--line)]" />
              <span className="px-3 text-[0.72rem] font-semibold uppercase tracking-wider text-[var(--muted)]">
                or register with email
              </span>
              <div className="flex-grow border-t border-[var(--line)]" />
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              <FormInput
                id="reg-fullname"
                label="Full Name"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors((p) => ({ ...p, fullName: '' }));
                }}
                placeholder="Your full name"
                icon={<User className="w-4 h-4" aria-hidden="true" />}
                error={errors.fullName}
              />

              <FormInput
                id="reg-email"
                label="Email Address"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((p) => ({ ...p, email: '' }));
                }}
                placeholder="name@example.com"
                icon={<Mail className="w-4 h-4" aria-hidden="true" />}
                error={errors.email}
              />

              <div className="flex flex-col gap-1.5">
                <FormInput
                  id="reg-password"
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: '' }));
                  }}
                  placeholder="Create a strong password"
                  icon={<Lock className="w-4 h-4" aria-hidden="true" />}
                  error={errors.password}
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

                <div className="space-y-1 pt-0.5">
                  <div className="flex gap-1 h-1.5 w-full bg-[var(--surface2)] rounded-full overflow-hidden">
                    {[1, 2, 3, 4].map((segment) => (
                      <div
                        key={segment}
                        className={`w-1/4 transition-colors ${
                          segment <= strength.score ? 'bg-[var(--good)]' : 'bg-[var(--line)]'
                        }`}
                      />
                    ))}
                  </div>
                  <p
                    className={`text-xs font-medium ${
                      strength.tone === 'error'
                        ? 'text-[var(--bad)]'
                        : strength.tone === 'secondary'
                        ? 'text-[var(--fol-ink)]'
                        : strength.tone === 'tertiary'
                        ? 'text-[var(--good)]'
                        : 'text-[var(--muted)]'
                    }`}
                  >
                    {strength.label}
                  </p>
                </div>
              </div>

              <FormInput
                id="reg-confirm-password"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: '' }));
                }}
                placeholder="Re-enter your password"
                icon={<Lock className="w-4 h-4" aria-hidden="true" />}
                error={
                  passwordsMismatch || errors.confirmPassword
                    ? errors.confirmPassword || 'Passwords do not match.'
                    : null
                }
                trailing={
                  <>
                    {passwordsMatch && (
                      <CheckCircle2 className="w-4 h-4 text-[var(--good)]" aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="p-1 text-[var(--muted)] hover:text-[var(--ink)] cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" aria-hidden="true" />
                      ) : (
                        <Eye className="w-4 h-4" aria-hidden="true" />
                      )}
                    </button>
                  </>
                }
              />

              <div className="flex flex-col gap-1">
                <label className="flex items-start gap-2.5 text-xs text-[var(--muted)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={acceptedPrivacy}
                    onChange={(e) => {
                      setAcceptedPrivacy(e.target.checked);
                      if (errors.acceptedPrivacy) setErrors((p) => ({ ...p, acceptedPrivacy: '' }));
                    }}
                    className="w-4 h-4 mt-0.5 rounded accent-[var(--plum)] cursor-pointer"
                  />
                  <span>
                    I consent to private health record storage under my Firebase account.
                  </span>
                </label>
                {errors.acceptedPrivacy && (
                  <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                    {errors.acceptedPrivacy}
                  </p>
                )}
              </div>

              <PrimaryButton type="submit" disabled={busy} className="w-full mt-1">
                <span>{submitting ? 'Creating Account...' : 'Create Account'}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </PrimaryButton>
            </form>

            <div className="text-center pt-3 border-t border-[var(--line)] text-xs text-[var(--muted)]">
              Already have an account?{' '}
              <Link to="/login" className="text-[var(--plum)] font-bold hover:underline">
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
