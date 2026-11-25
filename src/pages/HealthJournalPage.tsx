import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Search, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { journalService } from '../api/services';
import type { JournalCategory, JournalEntry } from '../types/api';
import { filterJournalEntries } from '../utils/healthCalculations';
import { formatClientError } from '../utils/errorDisplay';
import { validateJournalInput } from '../utils/validation';
import { formatShortDate } from '../utils/uiHelpers';

const CATEGORIES: Array<'All' | JournalCategory> = [
  'All',
  'General Reflection',
  'PCOS Symptom Log',
  'Cycle Tracking',
  'Nutrition & Diet',
  'Mental Wellness',
];

const DAILY_PROMPT =
  'How has your energy shifted across your cycle this month, and which self-care adjustments felt most supportive?';

export function HealthJournalPage() {
  const defaultDateTime = new Date().toISOString().slice(0, 16);

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [entryDate, setEntryDate] = useState(defaultDateTime);
  const [category, setCategory] = useState<JournalCategory>('General Reflection');
  const [content, setContent] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | JournalCategory>('All');
  const [deleteTarget, setDeleteTarget] = useState<JournalEntry | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await journalService.list();
      setEntries(Array.isArray(data) ? data : []);
    } catch (err) {
      setEntries([]);
      setApiError(formatClientError(err, 'Failed to load journal entries.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const filteredEntries = useMemo(
    () => filterJournalEntries(entries, searchQuery, categoryFilter),
    [entries, searchQuery, categoryFilter],
  );

  const resetEditor = () => {
    setEditingId(null);
    setTitle('');
    setEntryDate(new Date().toISOString().slice(0, 16));
    setCategory('General Reflection');
    setContent('');
    setFormErrors({});
  };

  const handleEdit = (entry: JournalEntry) => {
    setEditingId(entry.id);
    setTitle(entry.title);
    setEntryDate(entry.entryDate.slice(0, 16));
    setCategory(entry.category);
    setContent(entry.content);
    setFormErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateJournalInput({ title, content, entryDate });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        content: content.trim(),
        category,
        entryDate,
      };
      if (editingId) {
        await journalService.update(editingId, payload);
        setToast({ message: 'Entry updated.', variant: 'success' });
      } else {
        await journalService.create(payload);
        setToast({ message: 'Entry saved.', variant: 'success' });
      }
      resetEditor();
      await loadEntries();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to save journal entry.');
      const msg = typeof formatted === 'string' ? formatted : formatted.message;
      setFormErrors({ submit: msg });
      setToast({ message: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await journalService.remove(deleteTarget.id);
      setToast({ message: 'Entry deleted.', variant: 'success' });
      setDeleteTarget(null);
      if (editingId === deleteTarget.id) resetEditor();
      await loadEntries();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to delete journal entry.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell>
      {/* Pagehead */}
      <div>
        <p className="hhj-eyebrow">Private notes</p>
        <h1 className="font-display font-bold text-[clamp(1.9rem,4vw,2.5rem)] text-[var(--ink)] mt-1">
          Health journal
        </h1>
        <p className="text-sm text-[var(--muted)] mt-1 max-w-[60ch]">
          Symptoms, reflections, and questions for your care team—synced securely with Cloud Firestore.
        </p>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint="Cloud Firestore · journal"
        onRetry={loadEntries}
        retrying={loading}
      />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 items-start">
        {/* Left: Form + Today's Prompt */}
        <div className="flex flex-col gap-5">
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-4">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                {editingId ? 'Edit entry' : 'New entry'}
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {editingId
                  ? 'Changes update your saved entry in Cloud Firestore.'
                  : 'Persists directly to your Cloud Firestore journal.'}
              </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="j-title" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Title
                  </label>
                  <input
                    id="j-title"
                    type="text"
                    maxLength={120}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Morning check-in"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                  {formErrors.title && (
                    <p className="text-xs text-[var(--bad)]">{formErrors.title}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="j-tag" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                    Tag
                  </label>
                  <select
                    id="j-tag"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as JournalCategory)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  >
                    {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="j-date" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                  Date &amp; Time
                </label>
                <input
                  id="j-date"
                  type="datetime-local"
                  value={entryDate}
                  onChange={(e) => setEntryDate(e.target.value)}
                  className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                />
                {formErrors.entryDate && (
                  <p className="text-xs text-[var(--bad)]">{formErrors.entryDate}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="j-body" className="text-[0.84rem] font-semibold text-[var(--muted)]">
                  Entry
                </label>
                <textarea
                  id="j-body"
                  rows={7}
                  maxLength={5000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write about symptoms, mood, food, or anything you want to remember"
                  className="w-full px-3 py-2.5 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)] resize-y leading-relaxed"
                />
                {formErrors.content && (
                  <p className="text-xs text-[var(--bad)]">{formErrors.content}</p>
                )}
              </div>

              {formErrors.submit && (
                <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                  {formErrors.submit}
                </p>
              )}

              <div className="flex flex-wrap gap-2.5 pt-1">
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] px-[18px] py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update entry' : 'Save entry'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetEditor}
                    className="min-h-[42px] px-4 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-sm font-semibold text-[var(--ink)] cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </section>

          <section className="hhj-card-flat p-4 sm:p-5 lg:p-[22px]">
            <p className="hhj-eyebrow">Today&apos;s prompt</p>
            <p className="italic text-[var(--ink)] my-2.5 leading-relaxed">{DAILY_PROMPT}</p>
            <button
              type="button"
              onClick={() => {
                if (!title.trim()) setTitle('Cycle and energy reflection');
                setContent((prev) => (prev ? `${DAILY_PROMPT}\n\n${prev}` : `${DAILY_PROMPT}\n\n`));
              }}
              className="min-h-[34px] px-3.5 py-1.5 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
            >
              Use this prompt
            </button>
          </section>
        </div>

        {/* Right: Search, Tags & Expandable Entries */}
        <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
          <header className="mb-3">
            <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">Entries</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
            </p>
          </header>

          <div className="relative mb-3">
            <Search
              className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-3.5"
              aria-hidden="true"
            />
            <input
              type="search"
              aria-label="Search journal entries"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by keyword or tag"
              className="w-full min-h-[42px] pl-10 pr-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 mb-3">
            {CATEGORIES.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-full border text-xs transition-colors cursor-pointer ${
                    active
                      ? 'bg-[var(--plum)] text-[var(--plum-ink)] border-[var(--plum)] font-semibold'
                      : 'bg-[var(--surface)] text-[var(--ink)] border-[var(--line)] hover:bg-[var(--surface2)] font-medium'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {loading ? (
            <LoadingSkeleton rows={3} />
          ) : filteredEntries.length === 0 ? (
            <EmptyStateCard
              title={entries.length === 0 ? 'No entries yet' : 'No matching entries'}
              description={
                entries.length === 0
                  ? 'Entries saved to Cloud Firestore will appear here.'
                  : 'Try adjusting your search or tag filter.'
              }
            />
          ) : (
            <div className="divide-y divide-[var(--line)]">
              {filteredEntries.map((entry) => (
                <details key={entry.id} className="py-3.5 group">
                  <summary className="cursor-pointer list-none flex flex-col gap-1">
                    <span className="text-xs text-[var(--muted)] tabular-nums">
                      {formatShortDate(entry.entryDate)} · {entry.entryDate.slice(11, 16) || '—'}
                    </span>
                    <b className="text-[1.03rem] text-[var(--ink)]">{entry.title}</b>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--plum-soft)] text-[var(--plum)]">
                        {entry.category}
                      </span>
                    </div>
                  </summary>
                  <div className="whitespace-pre-wrap text-sm text-[var(--ink)] leading-relaxed my-3">
                    {entry.content}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(entry)}
                      className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--ink)] cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(entry)}
                      className="inline-flex items-center gap-1.5 min-h-[34px] px-3 py-1 rounded-[10px] border border-[var(--bad)] text-xs font-semibold text-[var(--bad)] hover:bg-[var(--bad-soft)] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Delete</span>
                    </button>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Journal Entry"
        description={
          deleteTarget
            ? `Permanently delete "${deleteTarget.title}"? This action cannot be undone.`
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
