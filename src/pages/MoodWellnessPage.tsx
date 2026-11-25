import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { MoodFaceSvg } from '../components/MoodFaceSvg';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { wellnessService } from '../api/services';
import type { MoodOption, SleepQualityOption, WellnessEntry } from '../types/api';
import { formatClientError } from '../utils/errorDisplay';
import { formatShortDate } from '../utils/uiHelpers';

const MOOD_OPTIONS: Array<{ value: MoodOption; label: string }> = [
  { value: 'Radiant', label: 'Bright' },
  { value: 'Calm', label: 'Calm' },
  { value: 'Fatigued', label: 'Tired' },
  { value: 'Anxious', label: 'Anxious' },
  { value: 'Low', label: 'Low' },
];

const SLEEP_QUALITIES: Array<{ value: SleepQualityOption; label: string }> = [
  { value: 'Restless', label: 'Restless' },
  { value: 'Good/Restful', label: 'Okay' },
  { value: 'Deep/Healing', label: 'Deep' },
];

export function MoodWellnessPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [entries, setEntries] = useState<WellnessEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [date, setDate] = useState(todayIso);
  const [mood, setMood] = useState<MoodOption>('Calm');
  const [sleepHours, setSleepHours] = useState(7.5);
  const [sleepQuality, setSleepQuality] = useState<SleepQualityOption>('Good/Restful');
  const [stressLevel, setStressLevel] = useState(3);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadWellness = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await wellnessService.list();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setEntries([]);
      setApiError(formatClientError(err, 'Failed to load wellness entries.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadWellness();
  }, [loadWellness]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await wellnessService.create({
        date,
        mood,
        sleepHours,
        sleepQuality,
        stressLevel,
        notes: notes.trim(),
      });
      setNotes('');
      setToast({ message: 'Entry saved.', variant: 'success' });
      await loadWellness();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to save wellness check-in.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const recentSeven = useMemo(
    () => [...entries].sort((a, b) => a.date.localeCompare(b.date)).slice(-7),
    [entries],
  );

  const avgSleep = useMemo(() => {
    if (entries.length === 0) return null;
    const total = entries.reduce((acc, item) => acc + item.sleepHours, 0);
    return (total / entries.length).toFixed(1);
  }, [entries]);

  const sleepInsight = useMemo(() => {
    const goodNights = entries.filter((x) => x.sleepHours >= 7.5);
    const shortNights = entries.filter((x) => x.sleepHours < 7.5);
    if (goodNights.length >= 2 && shortNights.length >= 2) {
      return `Logged ${goodNights.length} nights with 7.5+ hours of sleep and ${shortNights.length} shorter nights across your history.`;
    }
    return null;
  }, [entries]);

  return (
    <AppShell>
      {/* Editorial Header Banner with Artwork */}
      <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-primary)] bg-gradient-to-r from-[#103C32] via-[#174F40] to-[#092820] text-white p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#A8BCA4]/25 text-[#E4D2A5] border border-[#A8BCA4]/40 mb-2">
            Mind &amp; Rest
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F8F5EB]">
            Mood, Sleep &amp; Stress
          </h1>
          <p className="text-[#B9D2C5] text-sm mt-1.5 max-w-[55ch] leading-relaxed">
            Track daily emotional state, sleep duration, and restorative habits to see how rest and stress balance together.
          </p>
        </div>
        <div className="w-full md:w-[220px] h-[130px] rounded-[14px] overflow-hidden shrink-0 border border-[#A8BCA4]/30 shadow-md">
          <img
            src="/assets/images/mood_wellness.jpg"
            alt="Zen meditation corner with glowing ceramic candle and jade cup"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint="Cloud Firestore · wellness"
        onRetry={loadWellness}
        retrying={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5 items-start">
        {/* Left Check-In Form */}
        <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
          <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                How are you feeling?
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Syncs directly with Cloud Firestore.
              </p>
            </div>
            <input
              type="date"
              aria-label="Wellness check-in date"
              max={todayIso}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
            />
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* 5 MoodFaceSvg Selectors */}
            <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5" role="radiogroup" aria-label="Mood">
              {MOOD_OPTIONS.map((opt) => {
                const active = mood === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMood(opt.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-1.5 py-2.5 sm:py-3 px-0.5 sm:px-1 rounded-[14px] border text-[0.72rem] sm:text-[0.85rem] cursor-pointer transition-colors ${
                      active
                        ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                        : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                    }`}
                  >
                    <MoodFaceSvg mood={opt.value} className="w-7 h-7 sm:w-[34px] sm:h-[34px]" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="m-sleep" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                  Sleep last night: <b className="text-[var(--ink)] tabular-nums">{sleepHours}</b> h
                </label>
                <input
                  id="m-sleep"
                  type="range"
                  min={2}
                  max={12}
                  step={0.5}
                  value={sleepHours}
                  onChange={(e) => setSleepHours(Number(e.target.value))}
                  className="w-full accent-[var(--plum)] h-7 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[0.86rem] font-semibold text-[var(--muted)]">
                  Sleep quality
                </span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Sleep quality">
                  {SLEEP_QUALITIES.map((q) => {
                    const active = sleepQuality === q.value;
                    return (
                      <button
                        key={q.value}
                        type="button"
                        onClick={() => setSleepQuality(q.value)}
                        aria-pressed={active}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                            : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                        }`}
                      >
                        {q.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-stress" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                Stress: <b className="text-[var(--ink)] tabular-nums">{stressLevel}</b>/10
              </label>
              <input
                id="m-stress"
                type="range"
                min={1}
                max={10}
                step={1}
                value={stressLevel}
                onChange={(e) => setStressLevel(Number(e.target.value))}
                className="w-full accent-[var(--plum)] h-7 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-note" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                Notes
              </label>
              <textarea
                id="m-note"
                rows={4}
                maxLength={500}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Triggers, symptoms, or things you are grateful for"
                className="w-full px-3 py-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] resize-y"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={submitting}
                className="min-h-[42px] px-[18px] py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {submitting ? 'Saving...' : 'Save entry'}
              </button>
            </div>
          </form>
        </section>

        {/* Right Analytics */}
        <div className="flex flex-col gap-5">
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-4">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                This week
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Sleep hours with mood face</p>
            </header>

            {loading ? (
              <LoadingSkeleton rows={2} />
            ) : recentSeven.length > 0 ? (
              <div className="grid grid-cols-7 gap-2 items-end h-[190px]">
                {recentSeven.map((item) => {
                  const barHeight = Math.max(10, Math.min(110, (item.sleepHours / 10) * 110));
                  const isLatest = item.id === recentSeven[recentSeven.length - 1].id;
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col items-center justify-end gap-1.5 h-full text-xs text-[var(--muted)]"
                    >
                      <span className="font-bold text-[var(--ink)] tabular-nums">
                        {item.sleepHours}h
                      </span>
                      <div
                        className={`w-full max-w-[34px] rounded-t-[8px] rounded-b-[4px] ${
                          isLatest ? 'bg-[var(--plum)]' : 'bg-[var(--bar)]'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <MoodFaceSvg mood={item.mood} className="w-[22px] h-[22px] text-[var(--plum)]" />
                      <span className="text-[11px]">{formatShortDate(item.date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyStateCard
                title="No wellness history yet"
                description="Save mood and sleep check-ins to render your weekly rhythm strip."
              />
            )}

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-3.5">
                <span className="text-xs text-[var(--muted)] block">Average sleep</span>
                <b className="font-display text-2xl text-[var(--ink)] tabular-nums">
                  {avgSleep ? `${avgSleep} h` : '–'}
                </b>
              </div>
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[16px] p-3.5">
                <span className="text-xs text-[var(--muted)] block">Latest mood</span>
                <b className="font-display text-2xl text-[var(--ink)]">
                  {entries[0]?.mood ?? '–'}
                </b>
              </div>
            </div>
          </section>

          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-3">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Patterns
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Built from your wellness history
              </p>
            </header>

            {sleepInsight ? (
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[var(--plum)] shrink-0 mt-0.5" aria-hidden="true" />
                <p className="text-sm text-[var(--ink)] leading-relaxed">{sleepInsight}</p>
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)] leading-relaxed">
                Keep logging daily check-ins. Consistent sleep timing supports hormonal balance and stress recovery.
              </p>
            )}
          </section>
        </div>
      </div>

      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
