import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, LogOut, ShieldCheck, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { profileService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useTheme, type ThemeChoice } from '../context/ThemeContext';
import type { UserProfile } from '../types/api';
import { formatClientError } from '../utils/errorDisplay';
import { validateEmail } from '../utils/validation';

const THEME_OPTIONS: Array<{ value: ThemeChoice; label: string }> = [
  { value: 'system', label: 'Match device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

export function ProfilePage() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [cycleReminders, setCycleReminders] = useState(true);
  const [medicationAlerts, setMedicationAlerts] = useState(true);
  const [hydrationNudges, setHydrationNudges] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const applyProfileFields = useCallback((p: UserProfile) => {
    setFullName(p.fullName || '');
    setEmail(p.email || '');
    setDateOfBirth(p.dateOfBirth || '');
    setPhoneNumber(p.phoneNumber || '');
    setCycleReminders(Boolean(p.preferences?.cycleReminders));
    setMedicationAlerts(Boolean(p.preferences?.medicationAlerts));
    setHydrationNudges(Boolean(p.preferences?.hydrationNudges));
  }, []);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await profileService.get();
      setProfile(data);
      applyProfileFields(data);
    } catch (err) {
      setProfile(null);
      if (user) {
        setFullName(user.fullName);
        setEmail(user.email);
      }
      setApiError(formatClientError(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, [applyProfileFields, user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setFormError('Full name is required.');
      return;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setFormError(emailErr);
      return;
    }
    setFormError(null);
    setSaving(true);
    try {
      const updated = await profileService.update({
        fullName: fullName.trim(),
        email: email.trim(),
        dateOfBirth,
        phoneNumber: phoneNumber.trim(),
        preferences: {
          cycleReminders,
          medicationAlerts,
          hydrationNudges,
        },
      });
      setProfile(updated);
      applyProfileFields(updated);
      setToast({ message: 'Changes saved.', variant: 'success' });
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to save profile changes.');
      const msg = typeof formatted === 'string' ? formatted : formatted.message;
      setFormError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleExport = () => {
    if (!profile) {
      setToast({
        message: 'No profile record loaded to export yet.',
        variant: 'error',
      });
      return;
    }
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'her-health-profile.json';
    link.click();
    URL.revokeObjectURL(url);
    setToast({ message: 'Profile record exported as JSON.', variant: 'success' });
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await profileService.deleteAccount();
      setDeleteDialogOpen(false);
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteDialogOpen(false);
      const formatted = formatClientError(err, 'Unable to delete account.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <AppShell>
      {/* Pagehead */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="hhj-eyebrow">Account</p>
          <h1 className="font-display font-bold text-[clamp(1.9rem,4vw,2.5rem)] text-[var(--ink)] mt-1">
            Profile and settings
          </h1>
          <p className="text-sm text-[var(--muted)] mt-1">
            Your preferences, appearance, and Cloud Firestore account controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              if (profile) {
                applyProfileFields(profile);
                setToast({ message: 'Reverted unsaved changes.', variant: 'success' });
              } else {
                setFullName(user?.fullName || '');
                setEmail(user?.email || '');
                setDateOfBirth('');
                setPhoneNumber('');
                setToast({ message: 'Cleared unsaved draft fields.', variant: 'success' });
              }
            }}
            className="min-h-[40px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer"
          >
            Reset
          </button>
          <button
            type="submit"
            form="profile-settings-form"
            disabled={saving}
            className="min-h-[40px] px-4 py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint="Cloud Firestore · profile"
        onRetry={loadProfile}
        retrying={loading}
      />

      {loading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Left Stack: Profile Details & Appearance */}
          <div className="flex flex-col gap-5">
            <form
              id="profile-settings-form"
              onSubmit={handleSave}
              className="hhj-card p-4 sm:p-5 lg:p-[22px] flex flex-col gap-5"
            >
              <header>
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                  Personal details
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Updates sync securely with Cloud Firestore.
                </p>
              </header>

              {formError && (
                <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                  {formError}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="prof-name" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Full Name
                  </label>
                  <input
                    id="prof-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter full name"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5 sm:col-span-2">
                  <label htmlFor="prof-email" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Email Address
                  </label>
                  <input
                    id="prof-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-dob" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Date of Birth
                  </label>
                  <input
                    id="prof-dob"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="prof-phone" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Phone Number
                  </label>
                  <input
                    id="prof-phone"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--line)] space-y-3">
                <h3 className="font-display font-bold text-base text-[var(--ink)]">
                  Reminders
                </h3>
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Cycle Predictions &amp; Reminders</span>
                  <input
                    type="checkbox"
                    checked={cycleReminders}
                    onChange={(e) => setCycleReminders(e.target.checked)}
                    className="w-4 h-4 accent-[var(--plum)] cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Medication &amp; Supplement Alerts</span>
                  <input
                    type="checkbox"
                    checked={medicationAlerts}
                    onChange={(e) => setMedicationAlerts(e.target.checked)}
                    className="w-4 h-4 accent-[var(--plum)] cursor-pointer"
                  />
                </label>
                <label className="flex items-center justify-between gap-3 text-sm cursor-pointer">
                  <span>Hydration Nudges</span>
                  <input
                    type="checkbox"
                    checked={hydrationNudges}
                    onChange={(e) => setHydrationNudges(e.target.checked)}
                    className="w-4 h-4 accent-[var(--plum)] cursor-pointer"
                  />
                </label>
              </div>
            </form>

            {/* Appearance Switcher */}
            <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
              <header className="mb-3">
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                  Appearance
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Switch between light, dark, or match your device theme.
                </p>
              </header>

              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Theme appearance">
                {THEME_OPTIONS.map((opt) => {
                  const active = theme === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setTheme(opt.value);
                        setToast({ message: `Theme set to ${opt.label}.`, variant: 'success' });
                      }}
                      aria-pressed={active}
                      className={`min-h-[40px] px-4 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                          : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Stack: Account Summary, Data Export & Delete, About, Session */}
          <div className="flex flex-col gap-5">
            <section className="hhj-card p-4 sm:p-5 lg:p-[22px] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                    {fullName || 'Account Not Loaded'}
                  </h2>
                  <p className="text-sm text-[var(--muted)]">
                    {email || 'Signed in with Google or Email & Password'}
                  </p>
                </div>
                <ShieldCheck className="w-6 h-6 text-[var(--good)] shrink-0" aria-hidden="true" />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--line)] text-xs">
                <div className="bg-[var(--surface2)] rounded-[12px] p-3">
                  <span className="text-[var(--muted)] block">Member Since</span>
                  <b className="text-sm text-[var(--ink)] mt-0.5 block">
                    {profile?.memberSince ?? '—'}
                  </b>
                </div>
                <div className="bg-[var(--surface2)] rounded-[12px] p-3">
                  <span className="text-[var(--muted)] block">Data Sync</span>
                  <b className="text-sm text-[var(--good)] mt-0.5 block">
                    Cloud Firestore
                  </b>
                </div>
              </div>
            </section>

            <section className="hhj-card p-4 sm:p-5 lg:p-[22px] space-y-4">
              <header>
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                  Your data
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Export your loaded profile JSON or manage account deletion.
                </p>
              </header>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleExport}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer"
                >
                  <Download className="w-4 h-4" aria-hidden="true" />
                  <span>Export profile JSON</span>
                </button>

                <button
                  type="button"
                  onClick={() => setDeleteDialogOpen(true)}
                  className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-[12px] border border-[var(--bad)] text-sm font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                  <span>Delete account</span>
                </button>
              </div>
            </section>

            <section className="hhj-card p-4 sm:p-5 lg:p-[22px] flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-base text-[var(--ink)]">
                  Session control
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Sign out of your Firebase session on this device.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--bad-soft)] hover:text-[var(--bad)] text-sm font-semibold text-[var(--ink)] cursor-pointer whitespace-nowrap"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                <span>Sign Out</span>
              </button>
            </section>

            <section className="hhj-card-flat p-4 sm:p-5 lg:p-[22px]">
              <h3 className="font-display font-bold text-base text-[var(--ink)]">About this app</h3>
              <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                Her Health Journey is a personal tracking aid. It does not diagnose or treat any condition, and cycle predictions are estimates that should not be used as contraception.
              </p>
            </section>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Delete Account & Health Records"
        description="Are you sure you want to permanently delete your Firebase account and Cloud Firestore health records? This action cannot be undone."
        confirmLabel="Delete Account"
        destructive
        busy={deleting}
        onConfirm={() => void handleDeleteAccount()}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
