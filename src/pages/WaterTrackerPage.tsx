import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Bell, Droplets } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { waterService } from '../api/services';
import type { WaterTrackerResponse } from '../types/api';
import { formatClientError } from '../utils/errorDisplay';
import { calculateHydrationMetrics } from '../utils/healthCalculations';

export function WaterTrackerPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [data, setData] = useState<WaterTrackerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [targetInput, setTargetInput] = useState('2000');
  const [customMl, setCustomMl] = useState('250');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadWater = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const res = await waterService.getStatus(todayIso);
      setData(res);
      setTargetInput(String(res.dailyTargetMl));
    } catch (err) {
      setData(null);
      setApiError(formatClientError(err, 'Failed to load hydration status.'));
    } finally {
      setLoading(false);
    }
  }, [todayIso]);

  useEffect(() => {
    void loadWater();
  }, [loadWater]);

  const totalMl = data?.totalIntakeMl ?? 0;
  const targetMl = data?.dailyTargetMl ?? 0;
  const remindersEnabled = data?.remindersEnabled ?? true;

  const metrics = useMemo(
    () => calculateHydrationMetrics(totalMl, targetMl, 100),
    [totalMl, targetMl],
  );

  const handleAddWater = async (amountMl: number) => {
    if (!Number.isFinite(amountMl) || amountMl <= 0) {
      setToast({ message: 'Enter a valid water amount greater than 0 ml.', variant: 'error' });
      return;
    }
    setSaving(true);
    try {
      await waterService.logIntake({ date: todayIso, amountMl });
      setToast({ message: `+${amountMl} ml logged.`, variant: 'success' });
      await loadWater();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to log water intake.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = Number(targetInput);
    if (!Number.isFinite(parsed) || parsed < 500 || parsed > 6000) {
      setToast({ message: 'Daily target must be between 500 ml and 6,000 ml.', variant: 'error' });
      return;
    }
    setSaving(true);
    try {
      await waterService.updatePreferences({ dailyTargetMl: parsed });
      setToast({ message: `Daily water target updated to ${parsed} ml.`, variant: 'success' });
      await loadWater();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to update daily target.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleReminders = async (next: boolean) => {
    setSaving(true);
    try {
      await waterService.updatePreferences({ remindersEnabled: next });
      setToast({
        message: next ? 'Hydration reminders enabled.' : 'Hydration reminders paused.',
        variant: 'success',
      });
      await loadWater();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to update reminder setting.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const history = data?.weeklyHistory ?? [];
  const maxHistoryMl = Math.max(targetMl || 2000, ...history.map((h) => h.totalMl)) * 1.12;
  const glassesLeft = targetMl > totalMl ? Math.ceil((targetMl - totalMl) / 250) : 0;

  return (
    <AppShell>
      {/* Editorial Header Banner with Artwork */}
      <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-primary)] bg-gradient-to-r from-[#103C32] via-[#174F40] to-[#092820] text-white p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#70B8C8]/25 text-[#E4D2A5] border border-[#70B8C8]/40 mb-2">
            Hydrate &amp; Vitalize
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F8F5EB]">
            Hydration Tracker
          </h1>
          <p className="text-[#B9D2C5] text-sm mt-1.5 max-w-[55ch] leading-relaxed">
            One-tap water intake logging, customizable daily ml targets, and 7-day hydration trend history.
          </p>
        </div>
        <div className="w-full md:w-[220px] h-[130px] rounded-[14px] overflow-hidden shrink-0 border border-[#70B8C8]/30 shadow-md bg-[#F8F5EB]">
          <img
            src="/assets/images/water_hydration.svg"
            alt="Fluted glass carafe with fresh mint and crystal clear water"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint={`Cloud Firestore · water (${todayIso})`}
        onRetry={loadWater}
        retrying={loading}
      />

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
          {/* Left: Today SVG Ring + Quick Add */}
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px] flex flex-col gap-5">
            <header className="flex items-start justify-between gap-2">
              <div>
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">Today</h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  {targetMl > 0
                    ? glassesLeft === 0
                      ? 'Goal reached. Nice work.'
                      : `${glassesLeft} ${glassesLeft === 1 ? 'glass' : 'glasses'} (250 ml) to go`
                    : 'Loading your daily hydration target'}
                </p>
              </div>
              <Droplets className="w-5 h-5 text-[var(--plum)]" aria-hidden="true" />
            </header>

            <div className="relative w-[min(240px,100%)] aspect-square mx-auto">
              <svg
                viewBox="0 0 240 240"
                className="w-full h-full"
                role="img"
                aria-label={`${metrics.percentage} percent of daily water goal`}
              >
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="var(--surface2)"
                  strokeWidth="18"
                />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  fill="none"
                  stroke="var(--plum)"
                  strokeWidth="18"
                  strokeLinecap="round"
                  strokeDasharray={metrics.circumference}
                  strokeDashoffset={metrics.strokeDashoffset}
                  transform="rotate(-90 120 120)"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                <b className="font-display text-[2.6rem] leading-none text-[var(--ink)] tabular-nums">
                  {totalMl}
                </b>
                <span className="text-sm text-[var(--muted)] mt-1 tabular-nums">
                  {targetMl > 0 ? `of ${targetMl} ml` : 'of — ml'}
                </span>
                <span className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--plum-soft)] text-[var(--plum)] tabular-nums">
                  {targetMl > 0 ? `${metrics.percentage}%` : '—'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {[100, 250, 500, 750].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  disabled={saving}
                  onClick={() => void handleAddWater(amount)}
                  className="min-h-[42px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer disabled:opacity-60"
                >
                  +{amount}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleAddWater(Number(customMl));
              }}
              className="flex items-center justify-center gap-2"
            >
              <label htmlFor="w-custom" className="sr-only">
                Custom amount in ml
              </label>
              <input
                id="w-custom"
                type="number"
                min={1}
                max={3000}
                value={customMl}
                onChange={(e) => setCustomMl(e.target.value)}
                placeholder="Custom ml"
                className="max-w-[150px] min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] tabular-nums"
              />
              <button
                type="submit"
                disabled={saving}
                className="min-h-[42px] px-4 py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                Add
              </button>
            </form>
          </section>

          {/* Right Stack: Weekly Chart + Goal + Reminders + Today's Log */}
          <div className="flex flex-col gap-5">
            <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
              <header className="flex items-start justify-between gap-2 mb-4">
                <div>
                  <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                    Last 7 days
                  </h2>
                  <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
                    Dashed line is your daily target ({targetMl > 0 ? `${targetMl} ml` : '— ml'})
                  </p>
                </div>
              </header>

              {history.length > 0 ? (
                <svg
                  viewBox="0 0 560 190"
                  className="w-full h-auto block overflow-visible"
                  role="img"
                  aria-label="Water over the last 7 days in ml"
                >
                  <line x1="6" x2="554" y1="164" y2="164" stroke="var(--line)" />
                  {targetMl > 0 && (
                    <line
                      x1="6"
                      x2="554"
                      y1={164 - (targetMl / maxHistoryMl) * 140}
                      y2={164 - (targetMl / maxHistoryMl) * 140}
                      stroke="var(--muted)"
                      strokeDasharray="4 5"
                      opacity="0.7"
                    />
                  )}
                  {history.map((item, idx) => {
                    const n = history.length;
                    const iw = 548;
                    const bw = Math.min(54, (iw / n) * 0.62);
                    const cx = 6 + (iw / n) * (idx + 0.5);
                    const bh = Math.max(0, (item.totalMl / maxHistoryMl) * 140);
                    const y = 164 - bh;
                    const isLast = idx === n - 1;
                    return (
                      <g key={item.date}>
                        <rect
                          x={(cx - bw / 2).toFixed(1)}
                          y={y.toFixed(1)}
                          width={bw.toFixed(1)}
                          height={bh.toFixed(1)}
                          rx="7"
                          fill={isLast ? 'var(--plum)' : 'var(--bar)'}
                        />
                        {item.totalMl > 0 && (
                          <text
                            x={cx.toFixed(1)}
                            y={(y - 6).toFixed(1)}
                            textAnchor="middle"
                            className="text-[11px] font-semibold fill-[var(--muted)]"
                          >
                            {item.totalMl}
                          </text>
                        )}
                        <text
                          x={cx.toFixed(1)}
                          y="183"
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-[var(--muted)]"
                        >
                          {item.dayLabel}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <EmptyStateCard
                  title="No historical hydration records"
                  description="Log water intake to populate your 7-day hydration chart."
                />
              )}
            </section>

            {/* Target + Reminders */}
            <section className="hhj-card p-4 sm:p-5 lg:p-[22px] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="font-display font-bold text-base text-[var(--ink)]">
                    Daily water goal
                  </h2>
                  <p className="text-xs text-[var(--muted)]">Syncs directly with Cloud Firestore</p>
                </div>
                <form onSubmit={handleUpdateTarget} className="flex items-center gap-2">
                  <input
                    type="number"
                    aria-label="Daily water target in ml"
                    min={500}
                    max={6000}
                    step={50}
                    value={targetInput}
                    onChange={(e) => setTargetInput(e.target.value)}
                    className="w-28 min-h-[38px] px-3 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] tabular-nums"
                  />
                  <button
                    type="submit"
                    disabled={saving}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
                  >
                    Set Target
                  </button>
                </form>
              </div>

              <div className="pt-3 border-t border-[var(--line)] flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-9 h-9 rounded-[10px] bg-[var(--plum-soft)] text-[var(--plum)] grid place-items-center shrink-0">
                    <Bell className="w-4 h-4" aria-hidden="true" />
                  </span>
                  <div>
                    <b className="text-sm text-[var(--ink)] block">Hydration reminders</b>
                    <span className="text-xs text-[var(--muted)]">
                      Sync reminder preference with your account
                    </span>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    aria-label="Enable hydration reminders"
                    checked={remindersEnabled}
                    onChange={(e) => void handleToggleReminders(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[var(--surface2)] border border-[var(--line)] rounded-full peer peer-checked:bg-[var(--plum)] after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5" />
                </label>
              </div>
            </section>

            {/* Today's Log */}
            <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
              <header className="mb-3">
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                  Today&apos;s log
                </h2>
              </header>
              {data?.entries && data.entries.length > 0 ? (
                <ul className="divide-y divide-[var(--line)]">
                  {[...data.entries].reverse().map((item) => (
                    <li key={item.id} className="py-2 flex items-center justify-between text-sm">
                      <span>
                        <b className="tabular-nums text-[var(--ink)]">{item.amountMl} ml</b>{' '}
                        <span className="text-xs text-[var(--muted)]">at {item.loggedAt}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-[var(--muted)]">Nothing logged yet today.</p>
              )}
            </section>
          </div>
        </div>
      )}

      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
