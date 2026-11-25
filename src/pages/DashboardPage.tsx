import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Activity,
  BookOpen,
  Check,
  ChevronRight,
  Droplets,
  Plus,
  Smile,
  Sparkles,
  Utensils,
} from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { BrandLogo } from '../components/BrandLogo';
import { CycleWheel } from '../components/CycleWheel';
import { DashboardCard } from '../components/DashboardCard';
import { EmptyState } from '../components/EmptyState';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { MoodFaceSvg } from '../components/MoodFaceSvg';
import { PrimaryButton } from '../components/PrimaryButton';
import { ProgressIndicator } from '../components/ProgressIndicator';
import { SecondaryButton } from '../components/SecondaryButton';
import { SectionHeader } from '../components/SectionHeader';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { dashboardService, waterService } from '../api/services';
import { useAuth } from '../context/AuthContext';
import type { DashboardSummary } from '../types/api';
import { formatClientError } from '../utils/errorDisplay';
import { PHASE_META, formatShortDate } from '../utils/uiHelpers';

export function DashboardPage() {
  const { user, authReady, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setApiError(formatClientError(err, 'Failed to load dashboard summary.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authReady || !isAuthenticated) return;
    void loadDashboard();
  }, [authReady, isAuthenticated, loadDashboard]);

  const handleQuickWater = async (amountMl: number) => {
    const today = new Date().toISOString().slice(0, 10);
    try {
      await waterService.logIntake({ date: today, amountMl });
      setToast({ message: `Added ${amountMl} ml to today's hydration log.`, variant: 'success' });
      await loadDashboard();
    } catch (err) {
      const formatted = formatClientError(err, 'Failed to log water intake.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    }
  };

  const now = new Date();
  const hr = now.getHours();
  const timeGreeting = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const todayFormatted = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(now);

  const displayName = summary?.userName || user?.fullName;
  const heading = displayName ? `${timeGreeting}, ${displayName}` : timeGreeting;

  const rawPhase = summary?.cycleSummary?.phase;
  const phaseKey =
    rawPhase === 'Menstrual' ||
    rawPhase === 'Follicular' ||
    rawPhase === 'Ovulation' ||
    rawPhase === 'Luteal'
      ? rawPhase
      : 'Uncharted';
  const phaseMeta = PHASE_META[phaseKey];

  const avgCycle = summary?.cycleSummary?.averageCycleLength ?? 28;
  const currentDay = summary?.cycleSummary?.currentDay ?? null;
  const daysToNext = summary?.cycleSummary?.daysUntilNextPeriod ?? null;
  const nextPeriodDate = summary?.cycleSummary?.nextPeriodDate ?? null;

  const waterIntake = summary?.waterSummary?.intakeMl ?? 0;
  const waterTarget = summary?.waterSummary?.targetMl ?? 0;
  const waterPercent =
    waterTarget > 0 ? Math.min(100, Math.round((waterIntake / waterTarget) * 100)) : 0;

  const kcalConsumed = summary?.nutritionSummary?.caloriesConsumed ?? 0;
  const kcalTarget = summary?.nutritionSummary?.caloriesTarget ?? 0;

  const cycleHistory = summary?.cycleSummary?.cycleHistory ?? [];
  const maxCycleChart = Math.max(35, ...cycleHistory.map((c) => c.lengthDays), avgCycle) * 1.12;

  const checklist = [
    {
      to: '/wellness',
      label: 'Mood and wellness',
      sub: summary?.wellnessSummary?.mood
        ? `Logged · ${summary.wellnessSummary.mood}${
            summary.wellnessSummary.sleepHours != null
              ? `, ${summary.wellnessSummary.sleepHours} h`
              : ''
          }`
        : 'Not logged yet',
      done: Boolean(summary?.wellnessSummary?.mood),
      icon: Smile,
      accent: 'var(--module-wellness)',
    },
    {
      to: '/pcos-tracker',
      label: 'PCOS symptoms',
      sub: summary?.latestSymptom
        ? `Logged · severity ${summary.latestSymptom.severity}/5`
        : 'Not logged yet',
      done: Boolean(summary?.latestSymptom),
      icon: Activity,
      accent: 'var(--module-symptoms)',
    },
    {
      to: '/nutrition',
      label: 'Nutrition & diet',
      sub: kcalConsumed > 0 ? `${kcalConsumed} kcal logged` : 'Nothing logged yet',
      done: kcalConsumed > 0,
      icon: Utensils,
      accent: 'var(--module-nutrition)',
    },
    {
      to: '/journal',
      label: 'Health journal',
      sub:
        summary?.recentJournalEntries && summary.recentJournalEntries.length > 0
          ? `${summary.recentJournalEntries.length} recent ${
              summary.recentJournalEntries.length === 1 ? 'entry' : 'entries'
            }`
          : 'No entry loaded',
      done: Boolean(summary?.recentJournalEntries && summary.recentJournalEntries.length > 0),
      icon: BookOpen,
      accent: 'var(--module-journal)',
    },
  ];

  const derivedInsights: Array<{ warn?: boolean; text: string }> = [];
  if (daysToNext != null && daysToNext < -2) {
    derivedInsights.push({
      warn: true,
      text: `Your period is ${Math.abs(daysToNext)} days later than predicted. Check in with a clinician if cycles stay unusually late.`,
    });
  }
  if (summary?.wellnessSummary?.insight) {
    derivedInsights.push({ text: summary.wellnessSummary.insight });
  }
  if (summary?.latestSymptom?.observations) {
    derivedInsights.push({
      text: `Latest symptom note (${summary.latestSymptom.date}): ${summary.latestSymptom.observations}`,
    });
  }
  if (summary?.nutritionSummary?.sugarStatus) {
    derivedInsights.push({
      text: `Nutrition status: ${summary.nutritionSummary.sugarStatus}`,
    });
  }

  return (
    <AppShell>
      <SectionHeader
        eyebrow={todayFormatted}
        title={heading}
        action={
          <>
            <SecondaryButton to="/pcos-tracker" variant="outline">
              <Activity className="w-4 h-4 text-[var(--module-symptoms)]" aria-hidden="true" />
              <span>Log symptoms</span>
            </SecondaryButton>
            <PrimaryButton to="/period-tracker">
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Log period</span>
            </PrimaryButton>
          </>
        }
      />

      <ErrorState
        error={apiError}
        expectedEndpoint="Cloud Firestore · dashboard"
        onRetry={loadDashboard}
        retrying={loading}
      />

      {loading ? (
        <LoadingState rows={4} />
      ) : (
        <div className="flex flex-col gap-5">
          {/* Luxury Editorial Welcome Banner */}
          <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-primary)] shadow-sm bg-gradient-to-r from-[#103C32] via-[#174F40] to-[#092820] text-white">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="p-6 md:p-8 flex-1 z-10">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <BrandLogo variant="symbol" className="w-10 h-10" surface="dark" />
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#C5A66B]/25 text-[#E4D2A5] border border-[#C5A66B]/40">
                    {todayFormatted}
                  </span>
                </div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-[#F8F5EB] leading-snug">
                  {heading}
                </h2>
                <p className="text-[#B9D2C5] text-sm md:text-base mt-2 max-w-[48ch] leading-relaxed">
                  Your daily holistic sanctuary. All your biological rhythms, symptoms, and self-care in one synchronized view.
                </p>
              </div>
              <div className="w-full md:w-[320px] h-[160px] md:h-[180px] shrink-0 relative overflow-hidden">
                <img
                  src="/assets/images/dashboard_welcome.jpg"
                  alt="Luxury healthcare flat-lay on cream marble with deep emerald notebook"
                  className="w-full h-full object-cover object-center opacity-90 transition-transform duration-700 hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#103C32] via-transparent to-transparent" />
              </div>
            </div>
          </div>

          {/* Cycle Overview + Today Summary */}
          <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-5">
            <DashboardCard className="flex flex-col sm:flex-row items-center gap-6 sm:gap-7">
              <CycleWheel
                averageCycle={avgCycle}
                periodLength={5}
                ovulationDay={Math.max(9, avgCycle - 14)}
                currentDay={currentDay}
                phaseLabel={phaseMeta.name}
                phaseColor={phaseMeta.ink}
                sizeClass="w-[min(240px,100%)]"
              />

              <div className="flex-1 min-w-0 flex flex-col gap-3 w-full">
                {currentDay != null ? (
                  <>
                    <div>
                      <p className="hhj-eyebrow">Cycle phase</p>
                      <h2
                        className="font-display font-bold text-[1.6rem] mt-0.5"
                        style={{ color: phaseMeta.ink }}
                      >
                        {phaseMeta.name} phase
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--muted)]">
                      <span className="text-[var(--ink)] tabular-nums">
                        Day {currentDay} of {avgCycle}
                      </span>
                      {summary?.cycleSummary?.fertilityStatus && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[var(--ovu-ink)]">
                            {summary.cycleSummary.fertilityStatus}
                          </span>
                        </>
                      )}
                      {daysToNext != null && daysToNext < 0 && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-[var(--warn)]">
                            Period {Math.abs(daysToNext)} days late
                          </span>
                        </>
                      )}
                    </div>

                    <dl className="grid grid-cols-2 gap-3 m-0">
                      <div className="bg-[var(--bg-secondary)] rounded-[14px] px-3.5 py-3">
                        <dt className="text-[0.76rem] font-semibold text-[var(--muted)]">
                          Next period
                        </dt>
                        <dd className="font-bold text-[var(--ink)] mt-0.5 tabular-nums">
                          {daysToNext == null
                            ? '—'
                            : daysToNext < 0
                            ? 'Expected'
                            : `In ${daysToNext} ${daysToNext === 1 ? 'day' : 'days'}`}
                          {nextPeriodDate && (
                            <span className="block text-xs font-medium text-[var(--muted)]">
                              {formatShortDate(nextPeriodDate)}
                            </span>
                          )}
                        </dd>
                      </div>
                      <div className="bg-[var(--bg-secondary)] rounded-[14px] px-3.5 py-3">
                        <dt className="text-[0.76rem] font-semibold text-[var(--muted)]">
                          Average cycle
                        </dt>
                        <dd className="font-bold text-[var(--ink)] mt-0.5 tabular-nums">
                          {summary?.cycleSummary?.averageCycleLength != null
                            ? `${summary.cycleSummary.averageCycleLength} days`
                            : '—'}
                          <span className="block text-xs font-medium text-[var(--muted)]">
                            From cycle history
                          </span>
                        </dd>
                      </div>
                    </dl>

                    <p className="text-[0.86rem] text-[var(--muted)] leading-relaxed">
                      {phaseMeta.tip}
                    </p>
                  </>
                ) : (
                  <div>
                    <h2 className="font-display font-bold text-xl text-[var(--ink)] flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-sm bg-[var(--module-period)]"
                        aria-hidden="true"
                      />
                      <span>Start with your last period</span>
                    </h2>
                    <p className="text-sm text-[var(--muted)] mt-1.5 leading-relaxed">
                      Log period dates via Period Tracker so your dashboard can compute your cycle day, phase, and estimated next period.
                    </p>
                  </div>
                )}

                <div>
                  <Link
                    to="/period-tracker"
                    className="inline-flex items-center justify-center min-h-[36px] px-3.5 py-1.5 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] text-sm font-semibold transition-colors"
                  >
                    {currentDay != null ? 'Open calendar' : 'Log last period'}
                  </Link>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard title="Today's summary" subtitle={todayFormatted}>
              <ul className="divide-y divide-[var(--line)]">
                {checklist.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="flex items-center justify-between gap-3 py-2.5 text-[var(--ink)] hover:opacity-85 transition-opacity"
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <span
                            className="w-[34px] h-[34px] rounded-[10px] grid place-items-center shrink-0"
                            style={{
                              backgroundColor: item.done ? 'var(--ovu-soft)' : 'var(--bg-secondary)',
                              color: item.done ? 'var(--ovu-ink)' : item.accent,
                            }}
                          >
                            {item.done ? (
                              <Check className="w-4 h-4" aria-hidden="true" />
                            ) : (
                              <Icon className="w-4 h-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <b className="block text-sm font-semibold text-[var(--ink)]">
                              {item.label}
                            </b>
                            <span className="block text-xs text-[var(--muted)] truncate">
                              {item.sub}
                            </span>
                          </span>
                        </span>
                        <ChevronRight
                          className="w-4 h-4 text-[var(--muted)] shrink-0"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </DashboardCard>
          </div>

          {/* Middle 3 Summary Cards: Water / Mood & Wellness / Nutrition */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {/* Water (#70B8C8) */}
            <DashboardCard
              title="Water intake"
              subtitle={
                waterTarget > 0
                  ? `${waterPercent}% of ${waterTarget} ml goal`
                  : 'Set your daily hydration target'
              }
              accentColor="var(--module-water)"
              icon={<Droplets className="w-5 h-5 text-[var(--module-water)] shrink-0" aria-hidden="true" />}
              className="flex flex-col justify-between gap-3"
            >
              <div>
                <b className="font-display text-[1.9rem] font-bold text-[var(--ink)] tabular-nums">
                  {waterIntake}{' '}
                  <span className="text-base font-medium text-[var(--muted)]">ml</span>
                </b>
                <div className="my-3">
                  <ProgressIndicator
                    value={waterIntake}
                    max={waterTarget || 2000}
                    accentColor="var(--module-water)"
                    label="Daily water intake progress"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleQuickWater(250)}
                  className="min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
                >
                  +250 ml
                </button>
                <button
                  type="button"
                  onClick={() => void handleQuickWater(500)}
                  className="min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
                >
                  +500 ml
                </button>
                <Link
                  to="/water"
                  className="min-h-[34px] px-3 py-1 rounded-[10px] text-xs font-semibold text-[var(--plum)] hover:bg-[var(--surface2)] inline-flex items-center"
                >
                  Details
                </Link>
              </div>
            </DashboardCard>

            {/* Mood & Wellness (#A8BCA4) */}
            <DashboardCard
              title="Mood & sleep"
              subtitle={summary?.wellnessSummary?.mood ? 'Latest check-in' : 'No entry yet'}
              accentColor="var(--module-wellness)"
              icon={<Smile className="w-5 h-5 text-[var(--module-wellness)] shrink-0" aria-hidden="true" />}
              className="flex flex-col justify-between gap-3"
            >
              <div>
                {summary?.wellnessSummary?.mood ? (
                  <div className="flex items-center gap-3.5 py-1">
                    <span className="text-[var(--plum)] shrink-0">
                      <MoodFaceSvg mood={summary.wellnessSummary.mood} className="w-11 h-11" />
                    </span>
                    <div>
                      <b className="text-lg font-bold text-[var(--ink)]">
                        {summary.wellnessSummary.mood}
                      </b>
                      <p className="text-xs text-[var(--muted)] tabular-nums">
                        {summary.wellnessSummary.sleepHours != null
                          ? `${summary.wellnessSummary.sleepHours} h sleep`
                          : 'Sleep not recorded'}
                        {summary.wellnessSummary.energyLevel
                          ? ` · energy ${summary.wellnessSummary.energyLevel}`
                          : ''}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-[var(--muted)] py-1">No entries yet.</p>
                )}
              </div>

              <div>
                <Link
                  to="/wellness"
                  className="inline-flex items-center justify-center min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)]"
                >
                  {summary?.wellnessSummary?.mood ? 'Update mood' : 'Log mood'}
                </Link>
              </div>
            </DashboardCard>

            {/* Nutrition (#D8AA65) */}
            <DashboardCard
              title="Nutrition"
              subtitle={
                kcalTarget > 0 ? `Target ${kcalTarget} kcal` : 'Daily nutrition summary'
              }
              accentColor="var(--module-nutrition)"
              icon={<Utensils className="w-5 h-5 text-[var(--module-nutrition)] shrink-0" aria-hidden="true" />}
              className="flex flex-col justify-between gap-3"
            >
              <div>
                <b className="font-display text-[1.9rem] font-bold text-[var(--ink)] tabular-nums">
                  {kcalConsumed}{' '}
                  <span className="text-base font-medium text-[var(--muted)]">kcal</span>
                </b>
                <div className="my-3">
                  <ProgressIndicator
                    value={kcalConsumed}
                    max={kcalTarget || 2000}
                    accentColor="var(--module-nutrition)"
                    label="Daily nutrition calorie progress"
                  />
                </div>
              </div>

              <div>
                <Link
                  to="/nutrition"
                  className="inline-flex items-center justify-center min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)]"
                >
                  Log a meal
                </Link>
              </div>
            </DashboardCard>
          </div>

          {/* Bottom Split: Cycle Lengths Chart + Real Derived Insights */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <DashboardCard
              title="Cycle lengths"
              subtitle="Historical cycle days from your saved records. Dashed line marks average."
              accentColor="var(--module-period)"
            >
              {cycleHistory.length > 0 ? (
                <svg
                  viewBox="0 0 560 190"
                  className="w-full h-auto block overflow-visible"
                  role="img"
                  aria-label="Recent cycle lengths in days"
                >
                  <line x1="6" x2="554" y1="164" y2="164" stroke="var(--line)" />
                  {summary?.cycleSummary?.averageCycleLength && (
                    <line
                      x1="6"
                      x2="554"
                      y1={164 - (summary.cycleSummary.averageCycleLength / maxCycleChart) * 140}
                      y2={164 - (summary.cycleSummary.averageCycleLength / maxCycleChart) * 140}
                      stroke="var(--muted)"
                      strokeDasharray="4 5"
                      opacity="0.7"
                    />
                  )}
                  {cycleHistory.map((item, idx) => {
                    const n = cycleHistory.length;
                    const iw = 548;
                    const bw = Math.min(54, (iw / n) * 0.62);
                    const cx = 6 + (iw / n) * (idx + 0.5);
                    const bh = Math.max(0, (item.lengthDays / maxCycleChart) * 140);
                    const y = 164 - bh;
                    const isLast = idx === n - 1;
                    return (
                      <g key={item.month}>
                        <rect
                          x={(cx - bw / 2).toFixed(1)}
                          y={y.toFixed(1)}
                          width={bw.toFixed(1)}
                          height={bh.toFixed(1)}
                          rx="7"
                          fill={isLast ? 'var(--module-period)' : 'var(--bar)'}
                        />
                        <text
                          x={cx.toFixed(1)}
                          y={(y - 6).toFixed(1)}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-[var(--muted)] tabular-nums"
                        >
                          {item.lengthDays}
                        </text>
                        <text
                          x={cx.toFixed(1)}
                          y="183"
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-[var(--muted)]"
                        >
                          {item.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              ) : (
                <EmptyState
                  title="No Cycle Chart Data Yet"
                  description="Log at least two periods in Period Tracker to render your cycle length chart."
                />
              )}
            </DashboardCard>

            <DashboardCard
              title="Insights"
              subtitle="Derived directly from your Cloud Firestore records"
              accentColor="var(--brand-champagne)"
            >
              {derivedInsights.length > 0 ? (
                <div className="divide-y divide-[var(--line)]">
                  {derivedInsights.map((ins, i) => (
                    <div key={i} className="flex items-start gap-3 py-3 first:pt-1 last:pb-1">
                      <Sparkles
                        className="w-5 h-5 text-[var(--brand-champagne)] shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-[var(--ink)] leading-relaxed">{ins.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Insights appear as you log"
                  description="Record period, mood, or symptom entries to surface personal insights here."
                />
              )}
            </DashboardCard>
          </div>

          {/* Recent Journal */}
          <DashboardCard
            title="Recent journal"
            accentColor="var(--module-journal)"
            action={
              <Link
                to="/journal"
                className="inline-flex items-center justify-center min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--border-strong)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)]"
              >
                Open journal
              </Link>
            }
          >
            {summary?.recentJournalEntries && summary.recentJournalEntries.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {summary.recentJournalEntries.slice(0, 2).map((entry) => (
                  <div key={entry.id} className="hhj-card-flat p-4">
                    <span className="text-xs text-[var(--muted)]">
                      {formatShortDate(entry.entryDate)} · {entry.category}
                    </span>
                    <h3 className="font-display font-bold text-base text-[var(--ink)] mt-1 mb-1.5">
                      {entry.title}
                    </h3>
                    <p className="text-sm text-[var(--muted)] line-clamp-3">{entry.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No journal entries loaded yet"
                description="Write reflections, symptom notes, or questions for your care team in Health Journal."
                actionLabel="Write your first entry"
                onAction={() => navigate('/journal')}
              />
            )}
          </DashboardCard>
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
