import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { symptomsService } from '../api/services';
import type { PcosSymptomLog } from '../types/api';
import { formatClientError } from '../utils/errorDisplay';
import { buildClinicalSummary, formatLongDate } from '../utils/uiHelpers';

const PCOS_SYMPTOMS = [
  'Acne / Skin',
  'Fatigue',
  'Cramping',
  'Hair Growth',
  'Hair Thinning',
  'Mood Swings',
  'Bloating',
  'Cravings',
  'Headache',
];

const SEVERITY_PILLS: Array<{ val: number; label: string }> = [
  { val: 1, label: '1 Mild' },
  { val: 2, label: '2' },
  { val: 3, label: '3 Moderate' },
  { val: 4, label: '4' },
  { val: 5, label: '5 Severe' },
];

export function PcosTrackerPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [logs, setLogs] = useState<PcosSymptomLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [date, setDate] = useState(todayIso);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>(['Fatigue']);
  const [severity, setSeverity] = useState(3);
  const [painLevel, setPainLevel] = useState(2);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [observations, setObservations] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadSymptoms = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await symptomsService.list();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      setLogs([]);
      setApiError(formatClientError(err, 'Failed to load PCOS symptom logs.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSymptoms();
  }, [loadSymptoms]);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      setFormError('Please select a log date.');
      return;
    }
    if (selectedSymptoms.length === 0 && !observations.trim()) {
      setFormError('Select at least one symptom or enter personal observations.');
      return;
    }
    setFormError(null);
    setSubmitting(true);
    try {
      await symptomsService.create({
        date,
        symptoms: selectedSymptoms,
        severity,
        painLevel,
        energyLevel,
        observations: observations.trim(),
      });
      setObservations('');
      setToast({ message: 'Symptom entry saved.', variant: 'success' });
      await loadSymptoms();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to save symptom log.');
      const msg = typeof formatted === 'string' ? formatted : formatted.message;
      setFormError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await symptomsService.remove(id);
      setToast({ message: 'Entry deleted.', variant: 'success' });
      await loadSymptoms();
    } catch (err) {
      const formatted = formatClientError(err, 'Failed to remove symptom log.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    }
  };

  const frequencyStats = useMemo(() => {
    if (logs.length === 0) return [];
    const counts: Record<string, number> = {};
    for (const log of logs) {
      for (const s of log.symptoms) {
        counts[s] = (counts[s] || 0) + 1;
      }
    }
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percent: Math.round((count / logs.length) * 100),
      }))
      .sort((a, b) => b.percent - a.percent)
      .slice(0, 5);
  }, [logs]);

  const chartData = useMemo(() => {
    const recent = [...logs].sort((a, b) => a.date.localeCompare(b.date)).slice(-14);
    if (recent.length < 2) return null;
    const w = 560;
    const h = 200;
    const l = 26;
    const r = 12;
    const t = 12;
    const b = 26;
    const getX = (i: number) => l + ((w - l - r) * i) / (recent.length - 1);
    const getY = (val: number) => t + (h - t - b) * (1 - (val - 1) / 4);
    const coords = recent.map((item, idx) => ({
      x: getX(idx),
      y: getY(item.severity),
      date: item.date,
    }));
    const path = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(1)} ${c.y.toFixed(1)}`).join('');
    const mid = Math.floor(recent.length / 2);
    const firstAvg = recent.slice(0, mid).reduce((s, x) => s + x.severity, 0) / mid;
    const secondAvg = recent.slice(mid).reduce((s, x) => s + x.severity, 0) / (recent.length - mid);
    const diff = secondAvg - firstAvg;
    const trendLabel = diff > 0.4 ? 'Rising' : diff < -0.4 ? 'Easing' : 'Stable';
    return { coords, path, trendLabel, getY };
  }, [logs]);

  const clinicalText = useMemo(() => buildClinicalSummary(logs), [logs]);

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(clinicalText);
      setToast({ message: 'Doctor summary copied to clipboard.', variant: 'success' });
    } catch {
      setToast({ message: 'Select and copy the text box manually.', variant: 'error' });
    }
  };

  return (
    <AppShell>
      {/* Editorial Header Banner with Artwork */}
      <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-primary)] bg-gradient-to-r from-[#103C32] via-[#174F40] to-[#092820] text-white p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#B49AD8]/25 text-[#E4D2A5] border border-[#B49AD8]/40 mb-2">
            Hormonal Wellness
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F8F5EB]">
            PCOS Symptom Intelligence
          </h1>
          <p className="text-[#B9D2C5] text-sm mt-1.5 max-w-[55ch] leading-relaxed">
            Record energy, discomfort, and holistic observations. Discover monthly symptom rhythms with clean clinical summaries.
          </p>
        </div>
        <div className="w-full md:w-[220px] h-[130px] rounded-[14px] overflow-hidden shrink-0 border border-[#B49AD8]/30 shadow-md">
          <img
            src="/assets/images/pcos_wellness.jpg"
            alt="Holistic stones, lavender sprigs and sage leaves on textured linen"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint="Cloud Firestore · symptoms"
        onRetry={loadSymptoms}
        retrying={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5 items-start">
        {/* Left Daily Log Form */}
        <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
          <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
            <div>
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Daily log
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Record how you feel today or choose an earlier date.
              </p>
            </div>
            <input
              type="date"
              aria-label="Symptom log date"
              max={todayIso}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
            />
          </header>

          <form onSubmit={handleSubmit} className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-2">
              <span className="text-[0.86rem] font-semibold text-[var(--muted)]">
                Symptoms today
              </span>
              <div className="flex flex-wrap gap-2">
                {PCOS_SYMPTOMS.map((symptom) => {
                  const active = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => toggleSymptom(symptom)}
                      aria-pressed={active}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                        active
                          ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                          : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                      }`}
                    >
                      {symptom}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-[0.86rem] font-semibold text-[var(--muted)]">
                Overall severity
              </span>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Overall severity">
                {SEVERITY_PILLS.map((opt) => {
                  const active = severity === opt.val;
                  return (
                    <button
                      key={opt.val}
                      type="button"
                      onClick={() => setSeverity(opt.val)}
                      aria-pressed={active}
                      className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
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
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="pcos-pain" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                  Pelvic or abdominal pain: <b className="text-[var(--ink)] tabular-nums">{painLevel}</b>/10
                </label>
                <input
                  id="pcos-pain"
                  type="range"
                  min={0}
                  max={10}
                  step={1}
                  value={painLevel}
                  onChange={(e) => setPainLevel(Number(e.target.value))}
                  className="w-full accent-[var(--plum)] h-7 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="pcos-energy" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                  Energy: <b className="text-[var(--ink)] tabular-nums">{energyLevel}</b>/5
                </label>
                <input
                  id="pcos-energy"
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={energyLevel}
                  onChange={(e) => setEnergyLevel(Number(e.target.value))}
                  className="w-full accent-[var(--plum)] h-7 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="pcos-notes" className="text-[0.86rem] font-semibold text-[var(--muted)]">
                Notes (triggers, food, sleep, medication)
              </label>
              <textarea
                id="pcos-notes"
                rows={4}
                value={observations}
                onChange={(e) => setObservations(e.target.value)}
                placeholder="Note possible triggers, meals, rest quality, or medications..."
                className="w-full px-3 py-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] resize-y"
              />
            </div>

            {formError && (
              <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                {formError}
              </p>
            )}

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

        {/* Right Stack: Severity Chart, Frequency, Recent Entries */}
        <div className="flex flex-col gap-5">
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="flex items-start justify-between gap-2 mb-4">
              <div>
                <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                  Severity trend
                </h2>
                <p className="text-xs text-[var(--muted)] mt-0.5">
                  Each dot is a logged entry from your history.
                </p>
              </div>
              {chartData && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    chartData.trendLabel === 'Rising'
                      ? 'bg-[var(--warn-soft)] text-[var(--warn)]'
                      : 'bg-[var(--ovu-soft)] text-[var(--ovu-ink)]'
                  }`}
                >
                  {chartData.trendLabel}
                </span>
              )}
            </header>

            {loading ? (
              <LoadingSkeleton rows={2} />
            ) : chartData ? (
              <svg
                viewBox="0 0 560 200"
                className="w-full h-auto block overflow-visible"
                role="img"
                aria-label="PCOS symptom severity trend"
              >
                {[1, 2, 3, 4, 5].map((g) => (
                  <g key={g}>
                    <line
                      x1="26"
                      x2="548"
                      y1={chartData.getY(g)}
                      y2={chartData.getY(g)}
                      stroke="var(--line)"
                    />
                    <text
                      x="0"
                      y={chartData.getY(g) + 4}
                      className="text-[11px] font-semibold fill-[var(--muted)]"
                    >
                      {g}
                    </text>
                  </g>
                ))}
                <path
                  d={chartData.path}
                  fill="none"
                  stroke="var(--plum)"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {chartData.coords.map((pt, idx) => {
                  const isLast = idx === chartData.coords.length - 1;
                  return (
                    <circle
                      key={idx}
                      cx={pt.x.toFixed(1)}
                      cy={pt.y.toFixed(1)}
                      r={isLast ? 5.5 : 3.2}
                      fill="var(--plum)"
                      stroke={isLast ? 'var(--surface)' : undefined}
                      strokeWidth={isLast ? 2.5 : undefined}
                    />
                  );
                })}
                <text
                  x="26"
                  y="194"
                  textAnchor="start"
                  className="text-[11px] font-semibold fill-[var(--muted)]"
                >
                  {chartData.coords[0].date}
                </text>
                <text
                  x="548"
                  y="194"
                  textAnchor="end"
                  className="text-[11px] font-semibold fill-[var(--muted)]"
                >
                  {chartData.coords[chartData.coords.length - 1].date}
                </text>
              </svg>
            ) : (
              <EmptyStateCard
                title="Log at least two days to see a trend"
                description="Your 1-5 severity line chart plots from your saved symptom entries."
              />
            )}
          </section>

          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-3">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Most frequent
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">Share of logged entries</p>
            </header>

            {frequencyStats.length > 0 ? (
              <div className="space-y-3">
                {frequencyStats.map((stat) => (
                  <div key={stat.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[var(--ink)] font-medium">{stat.name}</span>
                      <b className="tabular-nums text-[var(--ink)]">{stat.percent}%</b>
                    </div>
                    <div className="h-2.5 rounded-full bg-[var(--surface2)] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--plum)]"
                        style={{ width: `${stat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--muted)]">Nothing logged yet.</p>
            )}
          </section>

          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-3">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Recent entries
              </h2>
            </header>

            {logs.length === 0 ? (
              <p className="text-sm text-[var(--muted)]">No symptom entries loaded yet.</p>
            ) : (
              <ul className="divide-y divide-[var(--line)]">
                {logs.map((entry) => (
                  <li key={entry.id} className="py-2.5 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <b className="text-sm text-[var(--ink)]">{formatLongDate(entry.date)}</b>
                      <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
                        Severity {entry.severity}/5 · Pain {entry.painLevel}/10 ·{' '}
                        {entry.symptoms.slice(0, 3).join(', ') || 'Observations only'}
                      </p>
                      {entry.observations && (
                        <p className="text-xs text-[var(--muted)] mt-1">{entry.observations}</p>
                      )}
                    </div>
                    <button
                      type="button"
                      aria-label={`Delete symptom log from ${entry.date}`}
                      onClick={() => void handleDelete(entry.id)}
                      className="p-1.5 rounded-[10px] text-[var(--bad)] hover:bg-[var(--bad-soft)] cursor-pointer shrink-0"
                    >
                      <Trash2 className="w-4 h-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {/* Expandable Summary for your doctor */}
      <details className="hhj-card p-4 sm:p-5 lg:p-[22px]">
        <summary className="cursor-pointer font-display font-bold text-base text-[var(--ink)]">
          Summary for your doctor
        </summary>
        <p className="text-xs text-[var(--muted)] mt-2 mb-3">
          Built directly from your loaded symptom records. Copy it into a message or take it to an appointment.
        </p>
        <textarea
          readOnly
          aria-label="Clinical symptom summary"
          value={clinicalText}
          className="w-full min-h-[160px] p-3 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] font-mono text-xs text-[var(--ink)] leading-relaxed"
        />
        <div className="mt-3">
          <button
            type="button"
            onClick={() => void handleCopySummary()}
            className="inline-flex items-center gap-2 min-h-[38px] px-4 py-1.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer"
          >
            <Copy className="w-4 h-4" aria-hidden="true" />
            <span>Copy summary</span>
          </button>
        </div>
      </details>

      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
