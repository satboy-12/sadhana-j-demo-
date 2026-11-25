import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { periodsService } from '../api/services';
import type { PeriodRecord } from '../types/api';
import { calculatePeriodEstimate, diffDaysInclusive } from '../utils/healthCalculations';
import { formatClientError } from '../utils/errorDisplay';
import { validatePeriodDates } from '../utils/validation';
import { PHASE_META, formatLongDate, formatShortDate } from '../utils/uiHelpers';

const PERIOD_SYMPTOMS = ['Cramps', 'Headache', 'Bloating', 'Fatigue', 'Backache', 'Nausea'];
const FLOW_OPTIONS: PeriodRecord['flowIntensity'][] = ['Spotting', 'Light', 'Moderate', 'Heavy'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function toIsoDate(year: number, monthZeroIdx: number, day: number): string {
  const m = String(monthZeroIdx + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${year}-${m}-${d}`;
}

export function PeriodTrackerPage() {
  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);

  const [periods, setPeriods] = useState<PeriodRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(todayIso);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [startDate, setStartDate] = useState(todayIso);
  const [endDate, setEndDate] = useState(todayIso);
  const [flowIntensity, setFlowIntensity] = useState<PeriodRecord['flowIntensity']>('Moderate');
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PeriodRecord | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadPeriods = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await periodsService.list();
      setPeriods(Array.isArray(data) ? data : []);
    } catch (err) {
      setPeriods([]);
      setApiError(formatClientError(err, 'Failed to load period records.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPeriods();
  }, [loadPeriods]);

  const estimate = useMemo(
    () => calculatePeriodEstimate(periods, todayIso),
    [periods, todayIso],
  );

  const calendarCells = useMemo(() => {
    const firstDay = new Date(Date.UTC(viewYear, viewMonth, 1));
    const daysInMonth = new Date(Date.UTC(viewYear, viewMonth + 1, 0)).getUTCDate();
    const offset = (firstDay.getUTCDay() + 6) % 7;

    const cells: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < offset; i += 1) {
      cells.push({ day: null, iso: null });
    }
    for (let d = 1; d <= daysInMonth; d += 1) {
      cells.push({ day: d, iso: toIsoDate(viewYear, viewMonth, d) });
    }
    while (cells.length % 7 !== 0) {
      cells.push({ day: null, iso: null });
    }
    return cells;
  }, [viewYear, viewMonth]);

  const monthLabel = new Intl.DateTimeFormat('en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(viewYear, viewMonth, 1)));

  const changeMonth = (delta: number) => {
    const next = new Date(Date.UTC(viewYear, viewMonth + delta, 1));
    setViewYear(next.getUTCFullYear());
    setViewMonth(next.getUTCMonth());
  };

  const jumpToToday = () => {
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDay(todayIso);
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom],
    );
  };

  const resetForm = () => {
    setEditingId(null);
    setStartDate(todayIso);
    setEndDate(todayIso);
    setFlowIntensity('Moderate');
    setSelectedSymptoms([]);
    setNotes('');
    setFormError(null);
  };

  const handleEdit = (record: PeriodRecord) => {
    setEditingId(record.id);
    setStartDate(record.startDate);
    setEndDate(record.endDate);
    setFlowIntensity(record.flowIntensity);
    setSelectedSymptoms(record.symptoms ?? []);
    setNotes(record.notes ?? '');
    setFormError(null);
    document.getElementById('periodform')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErr = validatePeriodDates(startDate, endDate);
    setFormError(validationErr);
    if (validationErr) return;

    setSubmitting(true);
    try {
      const payload = {
        startDate,
        endDate,
        flowIntensity,
        symptoms: selectedSymptoms,
        notes: notes.trim() || undefined,
      };
      if (editingId) {
        await periodsService.update(editingId, payload);
        setToast({ message: 'Period record updated.', variant: 'success' });
      } else {
        await periodsService.create(payload);
        setToast({ message: 'Period dates saved.', variant: 'success' });
      }
      resetForm();
      await loadPeriods();
    } catch (err) {
      const formatted = formatClientError(
        err,
        'Unable to save period entry. Please check your connection and try again.',
      );
      const msg = typeof formatted === 'string' ? formatted : formatted.message;
      setFormError(msg);
      setToast({ message: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await periodsService.remove(deleteTarget.id);
      setToast({ message: 'Period entry deleted.', variant: 'success' });
      setDeleteTarget(null);
      await loadPeriods();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to delete period entry.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const selectedDayRecord = periods.find(
    (p) => selectedDay >= p.startDate && selectedDay <= p.endDate,
  );
  const selectedIsEst =
    !selectedDayRecord &&
    estimate &&
    selectedDay >= estimate.nextPeriodStart &&
    selectedDay <= estimate.nextPeriodEnd;
  const selectedIsFertile =
    !selectedDayRecord &&
    estimate &&
    selectedDay >= estimate.fertileWindowStart &&
    selectedDay <= estimate.fertileWindowEnd;
  const selectedIsOvu = estimate && selectedDay === estimate.ovulationDate;

  const currentPhaseKey = estimate?.currentPhase ?? 'Uncharted';
  const currentPhaseMeta = PHASE_META[currentPhaseKey];

  return (
    <AppShell>
      {/* Pagehead */}
      <div>
        <p className="hhj-eyebrow">Cycle intelligence</p>
        <h1 className="font-display font-bold text-[clamp(1.9rem,4vw,2.5rem)] text-[var(--ink)] mt-1">
          Period and fertility
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-[60ch]">
          Log start and end dates, review cycle history, and view approximate estimates synced with Cloud Firestore.
        </p>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint="Cloud Firestore · periods"
        onRetry={loadPeriods}
        retrying={loading}
      />

      {/* 4 KPI Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-4 sm:p-[18px] flex flex-col gap-1">
          <span className="text-[0.84rem] text-[var(--muted)]">Average cycle</span>
          <b className="font-display text-[1.7rem] leading-tight text-[var(--ink)] tabular-nums">
            {estimate?.averageCycleLength ? `${estimate.averageCycleLength} days` : '—'}
          </b>
          <small className="text-[0.8rem] text-[var(--muted)]">
            {periods.length >= 2 ? `across ${periods.length} logged cycles` : 'needs 2+ cycles'}
          </small>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-4 sm:p-[18px] flex flex-col gap-1">
          <span className="text-[0.84rem] text-[var(--muted)]">Regularity</span>
          <b className="font-display text-[1.7rem] leading-tight text-[var(--ink)] tabular-nums">
            {estimate?.regularityScore != null ? `${estimate.regularityScore} / 100` : '—'}
          </b>
          <small className="text-[0.8rem] text-[var(--muted)]">
            {estimate?.regularityScore == null
              ? 'needs 3 logged cycles'
              : estimate.regularityScore >= 85
              ? 'very regular'
              : 'variable'}
          </small>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-4 sm:p-[18px] flex flex-col gap-1">
          <span className="text-[0.84rem] text-[var(--muted)]">Current phase</span>
          <b
            className="font-display text-[1.7rem] leading-tight"
            style={{ color: currentPhaseMeta.ink }}
          >
            {estimate?.currentPhase ?? '—'}
          </b>
          <small className="text-[0.8rem] text-[var(--muted)] tabular-nums">
            {estimate?.currentCycleDay
              ? `Day ${estimate.currentCycleDay} of ${estimate.averageCycleLength}`
              : 'log a period to start'}
          </small>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-4 sm:p-[18px] flex flex-col gap-1">
          <span className="text-[0.84rem] text-[var(--muted)]">Next period</span>
          <b className="font-display text-[1.7rem] leading-tight text-[var(--plum)] tabular-nums">
            {estimate?.nextPeriodStart ? formatShortDate(estimate.nextPeriodStart) : '—'}
          </b>
          <small className="text-[0.8rem] text-[var(--muted)]">
            {estimate
              ? `Fertile ${formatShortDate(estimate.fertileWindowStart)}`
              : 'awaiting records'}
          </small>
        </div>
      </div>

      {/* Main Grid: Calendar (1.45fr) + Selected Day & Log Form (1fr) */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5 items-start">
        {/* Monthly Calendar */}
        <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
          <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
            <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
              {monthLabel}
            </h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={jumpToToday}
                className="min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
              >
                Today
              </button>
              <button
                type="button"
                aria-label="Previous month"
                onClick={() => changeMonth(-1)}
                className="min-h-[34px] px-2.5 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label="Next month"
                onClick={() => changeMonth(1)}
                className="min-h-[34px] px-2.5 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d) => (
              <div
                key={d}
                className="text-[0.72rem] text-center text-[var(--muted)] font-bold tracking-[0.06em] py-1"
              >
                {d}
              </div>
            ))}

            {calendarCells.map((cell, idx) => {
              if (!cell.day || !cell.iso) {
                return (
                  <div
                    key={`empty-${idx}`}
                    className="aspect-[1/0.92] min-h-[42px] rounded-[12px] bg-[var(--surface2)] opacity-35"
                  />
                );
              }

              const periodMatch = periods.find(
                (p) => cell.iso! >= p.startDate && cell.iso! <= p.endDate,
              );
              const isEstPeriod =
                !periodMatch &&
                estimate &&
                cell.iso >= estimate.nextPeriodStart &&
                cell.iso <= estimate.nextPeriodEnd;
              const isFertile =
                !periodMatch &&
                estimate &&
                cell.iso >= estimate.fertileWindowStart &&
                cell.iso <= estimate.fertileWindowEnd;
              const isOvu = !periodMatch && estimate && cell.iso === estimate.ovulationDate;
              const isToday = cell.iso === todayIso;
              const isSel = cell.iso === selectedDay;

              let bgClass = 'bg-[var(--surface2)] text-[var(--ink)] border-transparent';
              let label = '';
              if (periodMatch) {
                bgClass = 'bg-[var(--c-men)] text-white border-transparent';
                label = periodMatch.startDate === cell.iso ? 'Start' : 'Period';
              } else if (isEstPeriod) {
                bgClass =
                  'bg-[var(--fol-soft)] text-[var(--fol-ink)] border-[1.5px] border-dashed border-[var(--c-fol)]';
                label = cell.iso === estimate?.nextPeriodStart ? 'Est.' : '';
              } else if (isFertile) {
                bgClass = 'bg-[var(--ovu-soft)] text-[var(--ovu-ink)] border-transparent';
                label = isOvu ? 'Ovul.' : 'Fertile';
              }

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => {
                    setSelectedDay(cell.iso!);
                    if (!editingId) {
                      setStartDate(cell.iso!);
                      setEndDate(cell.iso!);
                    }
                  }}
                  aria-label={`${formatLongDate(cell.iso)}${periodMatch ? ', period' : ''}`}
                  className={`relative aspect-[1/0.92] min-h-[44px] rounded-[12px] border flex flex-col items-start justify-between p-1.5 text-left font-semibold text-sm tabular-nums cursor-pointer transition-all ${bgClass} ${
                    isOvu ? 'shadow-[inset_0_0_0_2px_var(--c-ovu)]' : ''
                  } ${isToday ? '!border-2 !border-[var(--ink)]' : ''} ${
                    isSel ? 'outline-[3px] outline-[var(--plum)] outline-offset-1' : ''
                  }`}
                >
                  <span>{cell.day}</span>
                  {label ? (
                    <small className="text-[0.62rem] font-bold leading-none opacity-95 hidden sm:inline">
                      {label}
                    </small>
                  ) : (
                    <span />
                  )}
                  {periodMatch && (
                    <i className="absolute right-1.5 top-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap gap-3.5 text-xs text-[var(--muted)] mt-3.5">
            <span className="inline-flex items-center gap-1.5">
              <i className="w-3 h-3 rounded-[4px] bg-[var(--c-men)] inline-block" />
              Period
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="w-3 h-3 rounded-[4px] bg-[var(--fol-soft)] border-[1.5px] border-dashed border-[var(--c-fol)] inline-block" />
              Predicted
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="w-3 h-3 rounded-[4px] bg-[var(--ovu-soft)] inline-block" />
              Fertile window
            </span>
            <span className="inline-flex items-center gap-1.5">
              <i className="w-3 h-3 rounded-[4px] shadow-[inset_0_0_0_2px_var(--c-ovu)] inline-block" />
              Ovulation
            </span>
          </div>
        </section>

        {/* Right Stack: Selected Day + Log Form */}
        <div className="flex flex-col gap-5">
          {/* Selected Day Summary */}
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="flex items-start justify-between gap-2 mb-3">
              <div>
                <h2 className="font-display font-bold text-lg text-[var(--ink)]">
                  {formatLongDate(selectedDay)}
                </h2>
                <p className="text-xs text-[var(--muted)]">
                  {selectedDay === todayIso
                    ? 'Today'
                    : selectedDay > todayIso
                    ? 'Upcoming'
                    : 'Past day'}
                </p>
              </div>
              {selectedDayRecord && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--men-soft)] text-[var(--men-ink)]">
                  Period day
                </span>
              )}
            </header>

            {selectedDayRecord || selectedIsEst || selectedIsFertile || selectedIsOvu ? (
              <ul className="divide-y divide-[var(--line)] text-sm">
                {selectedDayRecord && (
                  <li className="py-2 flex items-center justify-between">
                    <span>Period logged ({selectedDayRecord.flowIntensity})</span>
                    <button
                      type="button"
                      onClick={() => handleEdit(selectedDayRecord)}
                      className="text-xs font-semibold text-[var(--plum)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                  </li>
                )}
                {selectedIsEst && <li className="py-2">Predicted period day</li>}
                {selectedIsFertile && <li className="py-2">Approx. fertile window</li>}
                {selectedIsOvu && <li className="py-2">Estimated ovulation date</li>}
              </ul>
            ) : (
              <p className="text-sm text-[var(--muted)]">No cycle events recorded on this date.</p>
            )}

            {selectedDay <= todayIso && (
              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setStartDate(selectedDay);
                    setEndDate(selectedDay);
                  }}
                  className="min-h-[34px] px-3 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
                >
                  Use {formatShortDate(selectedDay)} as start date
                </button>
              </div>
            )}
          </section>

          {/* Log / Edit Period Form */}
          <section id="periodform" className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-4">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                {editingId ? 'Edit period' : 'Log a period'}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {editingId ? 'Updates your saved record in Cloud Firestore.' : 'Saved securely to your Cloud Firestore account.'}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="p-start" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    First day
                  </label>
                  <input
                    id="p-start"
                    type="date"
                    max={todayIso}
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full min-h-[44px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="p-end" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Last day
                  </label>
                  <input
                    id="p-end"
                    type="date"
                    max={todayIso}
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full min-h-[44px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[0.84rem] font-semibold text-[var(--muted)]">Flow</span>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Flow intensity">
                  {FLOW_OPTIONS.map((flow) => {
                    const active = flowIntensity === flow;
                    return (
                      <button
                        key={flow}
                        type="button"
                        onClick={() => setFlowIntensity(flow)}
                        aria-pressed={active}
                        className={`min-h-[38px] px-3.5 py-1.5 rounded-full border text-sm transition-colors cursor-pointer ${
                          active
                            ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                            : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                        }`}
                      >
                        {flow}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-[0.84rem] font-semibold text-[var(--muted)]">Symptoms</span>
                <div className="flex flex-wrap gap-2">
                  {PERIOD_SYMPTOMS.map((symptom) => {
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

              <div className="flex flex-col gap-1.5">
                <label htmlFor="p-notes" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                  Notes (optional)
                </label>
                <textarea
                  id="p-notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional cycle observations..."
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] resize-y"
                />
              </div>

              {formError && (
                <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                  {formError}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] px-[18px] py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update period' : 'Save period'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="min-h-[42px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>
        </div>
      </div>

      {/* Cycle History Table */}
      <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
        <header className="mb-4">
          <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
            Cycle history
          </h2>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            Logged menstrual cycles synced with Cloud Firestore.
          </p>
        </header>

        {loading ? (
          <LoadingSkeleton rows={3} />
        ) : periods.length === 0 ? (
          <EmptyStateCard
            title="No periods logged yet"
            description="Logged period start and end dates will appear here."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left border-collapse text-sm">
              <thead>
                <tr className="text-[0.76rem] uppercase tracking-[0.06em] text-[var(--muted)] border-b border-[var(--line)]">
                  <th className="py-2 px-2.5">Start</th>
                  <th className="py-2 px-2.5">End</th>
                  <th className="py-2 px-2.5">Length</th>
                  <th className="py-2 px-2.5">Flow</th>
                  <th className="py-2 px-2.5">Symptoms</th>
                  <th className="py-2 px-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] tabular-nums">
                {periods.map((record) => {
                  const duration = diffDaysInclusive(record.startDate, record.endDate);
                  return (
                    <tr key={record.id} className="hover:bg-[var(--surface2)]/40">
                      <td className="py-2.5 px-2.5 font-semibold">{record.startDate}</td>
                      <td className="py-2.5 px-2.5">{record.endDate}</td>
                      <td className="py-2.5 px-2.5">{duration} d</td>
                      <td className="py-2.5 px-2.5">{record.flowIntensity}</td>
                      <td className="py-2.5 px-2.5 text-[var(--muted)]">
                        {record.symptoms.length > 0 ? record.symptoms.join(', ') : '—'}
                      </td>
                      <td className="py-2.5 px-2.5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          aria-label={`Edit cycle starting ${record.startDate}`}
                          onClick={() => handleEdit(record)}
                          className="p-1.5 rounded-[10px] text-[var(--muted)] hover:bg-[var(--surface2)] hover:text-[var(--ink)] cursor-pointer mr-1"
                        >
                          <Pencil className="w-4 h-4" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          aria-label={`Delete cycle starting ${record.startDate}`}
                          onClick={() => setDeleteTarget(record)}
                          className="p-1.5 rounded-[10px] text-[var(--bad)] hover:bg-[var(--bad-soft)] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Period Entry"
        description={
          deleteTarget
            ? `Are you sure you want to delete the cycle from ${deleteTarget.startDate} to ${deleteTarget.endDate}?`
            : ''
        }
        confirmLabel="Delete"
        destructive
        busy={deleting}
        onConfirm={() => void handleConfirmDelete()}
        onCancel={() => setDeleteTarget(null)}
      />

      <ToastBanner
        message={toast?.message ?? null}
        variant={toast?.variant}
        onDismiss={() => setToast(null)}
      />
    </AppShell>
  );
}
