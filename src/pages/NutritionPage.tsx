import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { AppShell } from '../components/AppShell';
import { ApiIntegrationBanner } from '../components/ApiIntegrationBanner';
import { EmptyStateCard } from '../components/EmptyStateCard';
import { LoadingSkeleton } from '../components/LoadingSkeleton';
import { ToastBanner } from '../components/ToastBanner';
import { ApiError } from '../api/client';
import { nutritionService } from '../api/services';
import type { MealCategory, NutritionSummaryResponse } from '../types/api';
import { addDaysIso, sumNutritionMacros } from '../utils/healthCalculations';
import { formatClientError } from '../utils/errorDisplay';
import { validateMealInput } from '../utils/validation';
import { COMMON_FOODS, formatLongDate, formatShortDate } from '../utils/uiHelpers';

const SLOTS: MealCategory[] = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

export function NutritionPage() {
  const todayIso = new Date().toISOString().slice(0, 10);

  const [selectedDate, setSelectedDate] = useState(todayIso);
  const [summary, setSummary] = useState<NutritionSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<ApiError | string | null>(null);

  const [mealType, setMealType] = useState<MealCategory>('Breakfast');
  const [foodName, setFoodName] = useState('');
  const [portion, setPortion] = useState('1 serving');
  const [calories, setCalories] = useState('');
  const [proteinGrams, setProteinGrams] = useState('');
  const [carbsGrams, setCarbsGrams] = useState('');
  const [fatGrams, setFatGrams] = useState('');
  const [fiberGrams, setFiberGrams] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; variant: 'success' | 'error' } | null>(null);

  const loadNutrition = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await nutritionService.getSummary(selectedDate);
      setSummary(data);
    } catch (err) {
      setSummary(null);
      setApiError(formatClientError(err, 'Failed to load nutrition diary.'));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadNutrition();
  }, [loadNutrition]);

  const meals = summary?.meals ?? [];
  const totals = useMemo(() => sumNutritionMacros(meals), [meals]);
  const targets = summary?.targets ?? {
    calories: 0,
    proteinGrams: 0,
    carbsGrams: 0,
    fatGrams: 0,
    fiberGrams: 0,
  };

  const shiftDate = (delta: number) => {
    const next = addDaysIso(selectedDate, delta);
    if (next <= todayIso) setSelectedDate(next);
  };

  const handleQuickFill = (presetIndex: number) => {
    const f = COMMON_FOODS[presetIndex];
    if (!f) return;
    setFoodName(f.foodName);
    setPortion(f.portion);
    setCalories(String(f.calories));
    setProteinGrams(String(f.proteinGrams));
    setCarbsGrams(String(f.carbsGrams));
    setFatGrams(String(f.fatGrams));
    setFiberGrams(String(f.fiberGrams));
    setFormErrors({});
  };

  const handleCreateMeal = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCal = Number(calories);
    const errors = validateMealInput({
      foodName,
      portion,
      calories: calories === '' ? -1 : parsedCal,
    });
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    try {
      await nutritionService.createMeal({
        date: selectedDate,
        mealType,
        foodName: foodName.trim(),
        portion: portion.trim(),
        calories: parsedCal,
        proteinGrams: Number(proteinGrams) || 0,
        carbsGrams: Number(carbsGrams) || 0,
        fatGrams: Number(fatGrams) || 0,
        fiberGrams: Number(fiberGrams) || 0,
      });
      setFoodName('');
      setCalories('');
      setProteinGrams('');
      setCarbsGrams('');
      setFatGrams('');
      setFiberGrams('');
      setToast({ message: `Added "${foodName.trim()}" to ${mealType}.`, variant: 'success' });
      await loadNutrition();
    } catch (err) {
      const formatted = formatClientError(err, 'Unable to save meal item.');
      const msg = typeof formatted === 'string' ? formatted : formatted.message;
      setFormErrors({ submit: msg });
      setToast({ message: msg, variant: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMeal = async (id: string) => {
    try {
      await nutritionService.removeMeal(id);
      setToast({ message: 'Meal item removed.', variant: 'success' });
      await loadNutrition();
    } catch (err) {
      const formatted = formatClientError(err, 'Failed to remove meal item.');
      setToast({
        message: typeof formatted === 'string' ? formatted : formatted.message,
        variant: 'error',
      });
    }
  };

  const macroTiles = [
    {
      label: 'Calories',
      val: Math.round(totals.calories),
      goal: targets.calories,
      unit: 'kcal',
      color: 'var(--plum)',
    },
    {
      label: 'Protein',
      val: Math.round(totals.proteinGrams),
      goal: targets.proteinGrams,
      unit: 'g',
      color: 'var(--c-men)',
    },
    {
      label: 'Carbs',
      val: Math.round(totals.carbsGrams),
      goal: targets.carbsGrams,
      unit: 'g',
      color: 'var(--c-ovu)',
    },
    {
      label: 'Fat',
      val: Math.round(totals.fatGrams),
      goal: targets.fatGrams,
      unit: 'g',
      color: 'var(--c-lut)',
    },
  ];

  const weeklyTotals = summary?.weeklyTotals ?? [];
  const maxWeeklyKcal = Math.max(targets.calories || 2000, ...weeklyTotals.map((w) => w.calories)) * 1.12;

  return (
    <AppShell>
      {/* Editorial Header Banner with Artwork */}
      <div className="relative overflow-hidden rounded-[18px] border border-[var(--border-primary)] bg-gradient-to-r from-[#103C32] via-[#174F40] to-[#092820] text-white p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex-1">
          <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-[#D8AA65]/25 text-[#E4D2A5] border border-[#D8AA65]/40 mb-2">
            Nourish &amp; Balance
          </span>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#F8F5EB]">
            Nutrition &amp; Macro Balance
          </h1>
          <p className="text-[#B9D2C5] text-sm mt-1.5 max-w-[55ch] leading-relaxed">
            Log breakfast, lunch, dinner, and wholesome snacks with calorie and macronutrient tracking designed for sustained metabolic vitality.
          </p>
        </div>
        <div className="w-full md:w-[220px] h-[130px] rounded-[14px] overflow-hidden shrink-0 border border-[#D8AA65]/30 shadow-md">
          <img
            src="/assets/images/nutrition_food.jpg"
            alt="Mediterranean nourishing breakfast bowl with avocado, berries and greens in emerald bowl"
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* Date stepper bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--muted)]">Meal diary for selected date</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => shiftDate(-1)}
            className="min-h-[36px] px-2.5 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          </button>
          <strong className="sm:min-w-[10.5rem] text-center text-sm font-bold text-[var(--ink)] tabular-nums">
            {selectedDate === todayIso ? `Today, ${formatLongDate(selectedDate)}` : formatLongDate(selectedDate)}
          </strong>
          <button
            type="button"
            aria-label="Next day"
            disabled={selectedDate >= todayIso}
            onClick={() => shiftDate(1)}
            className="min-h-[36px] px-2.5 py-1 rounded-[10px] border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-[var(--ink)] cursor-pointer disabled:opacity-40"
          >
            <ChevronRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <ApiIntegrationBanner
        error={apiError}
        expectedEndpoint={`Cloud Firestore · nutrition (${selectedDate})`}
        onRetry={loadNutrition}
        retrying={loading}
      />

      {/* 4 Macro Stat Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {macroTiles.map((tile) => {
          const pct = tile.goal > 0 ? Math.min(100, Math.round((tile.val / tile.goal) * 100)) : 0;
          return (
            <div
              key={tile.label}
              className="bg-[var(--surface)] border border-[var(--line)] rounded-[18px] p-4 sm:p-[18px] flex flex-col gap-2"
            >
              <span className="text-[0.84rem] text-[var(--muted)]">{tile.label}</span>
              <b className="font-display text-[1.5rem] leading-tight text-[var(--ink)] tabular-nums">
                {tile.val}{' '}
                <span className="text-sm font-medium text-[var(--muted)]">
                  / {tile.goal > 0 ? `${tile.goal} ${tile.unit}` : `— ${tile.unit}`}
                </span>
              </b>
              <div className="h-2.5 rounded-full bg-[var(--surface2)] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: tile.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.45fr_1fr] gap-5 items-start">
        {/* Left: Meals Slots + Inline Add Food Card */}
        <div className="flex flex-col gap-5">
          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-3">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">Meals</h2>
              <p className="text-xs text-[var(--muted)] mt-0.5 tabular-nums">
                Fiber logged: {Math.round(totals.fiberGrams)} of{' '}
                {targets.fiberGrams > 0 ? `${targets.fiberGrams} g` : '28 g'}
              </p>
            </header>

            {loading ? (
              <LoadingSkeleton rows={4} />
            ) : (
              <div>
                {SLOTS.map((slot) => {
                  const items = meals.filter((m) => m.mealType === slot);
                  const slotKcal = Math.round(items.reduce((s, m) => s + m.calories, 0));
                  return (
                    <div key={slot} className="border-t border-[var(--line)] py-3.5 first:border-t-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-display font-bold text-base text-[var(--ink)]">
                          {slot}{' '}
                          <span className="text-xs font-medium text-[var(--muted)] tabular-nums ml-1">
                            {slotKcal} kcal
                          </span>
                        </h3>
                        <button
                          type="button"
                          onClick={() => {
                            setMealType(slot);
                            document.getElementById('mealform')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="inline-flex items-center gap-1 min-h-[32px] px-2.5 py-1 rounded-[10px] hover:bg-[var(--surface2)] text-xs font-semibold text-[var(--plum)] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Add</span>
                        </button>
                      </div>

                      {items.length > 0 ? (
                        <ul className="divide-y divide-[var(--line)] mt-2">
                          {items.map((item) => (
                            <li key={item.id} className="py-2 flex items-center justify-between gap-3">
                              <div>
                                <b className="text-sm text-[var(--ink)]">{item.foodName}</b>
                                <span className="block text-xs text-[var(--muted)] tabular-nums">
                                  {item.portion} · {Math.round(item.calories)} kcal · P{' '}
                                  {Math.round(item.proteinGrams)}g · C {Math.round(item.carbsGrams)}g · F{' '}
                                  {Math.round(item.fatGrams)}g
                                </span>
                              </div>
                              <button
                                type="button"
                                aria-label={`Remove ${item.foodName}`}
                                onClick={() => void handleDeleteMeal(item.id)}
                                className="p-1.5 rounded-[10px] text-[var(--bad)] hover:bg-[var(--bad-soft)] cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-xs text-[var(--muted)] mt-1.5">Nothing logged.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Add Food Form Card */}
          <section id="mealform" className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-3">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Add food
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Pick a common food to fill the fields, or enter custom nutrition values to save to Cloud Firestore.
              </p>
            </header>

            <div className="flex flex-wrap gap-1.5 max-h-[126px] overflow-auto mb-4">
              {COMMON_FOODS.map((f, idx) => (
                <button
                  key={f.foodName}
                  type="button"
                  onClick={() => handleQuickFill(idx)}
                  className="px-3 py-1.5 rounded-full border border-[var(--line)] bg-[var(--surface)] hover:bg-[var(--surface2)] text-xs font-medium text-[var(--ink)] cursor-pointer"
                >
                  {f.foodName} ({f.portion})
                </button>
              ))}
            </div>

            <form onSubmit={handleCreateMeal} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="f-slot" className="text-xs font-semibold text-[var(--muted)]">
                    Meal
                  </label>
                  <select
                    id="f-slot"
                    value={mealType}
                    onChange={(e) => setMealType(e.target.value as MealCategory)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  >
                    {SLOTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-name" className="text-xs font-semibold text-[var(--muted)]">
                    Food
                  </label>
                  <input
                    id="f-name"
                    type="text"
                    maxLength={120}
                    value={foodName}
                    onChange={(e) => setFoodName(e.target.value)}
                    placeholder="e.g. Avocado toast"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                  {formErrors.foodName && (
                    <p className="text-xs text-[var(--bad)]">{formErrors.foodName}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-portion" className="text-xs font-semibold text-[var(--muted)]">
                    Portion
                  </label>
                  <input
                    id="f-portion"
                    type="text"
                    maxLength={60}
                    value={portion}
                    onChange={(e) => setPortion(e.target.value)}
                    placeholder="1 serving"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                  {formErrors.portion && (
                    <p className="text-xs text-[var(--bad)]">{formErrors.portion}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-kcal" className="text-xs font-semibold text-[var(--muted)]">
                    Calories (kcal)
                  </label>
                  <input
                    id="f-kcal"
                    type="number"
                    min={0}
                    step="any"
                    value={calories}
                    onChange={(e) => setCalories(e.target.value)}
                    placeholder="320"
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                  {formErrors.calories && (
                    <p className="text-xs text-[var(--bad)]">{formErrors.calories}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-p" className="text-xs font-semibold text-[var(--muted)]">
                    Protein (g)
                  </label>
                  <input
                    id="f-p"
                    type="number"
                    min={0}
                    step="any"
                    value={proteinGrams}
                    onChange={(e) => setProteinGrams(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-c" className="text-xs font-semibold text-[var(--muted)]">
                    Carbs (g)
                  </label>
                  <input
                    id="f-c"
                    type="number"
                    min={0}
                    step="any"
                    value={carbsGrams}
                    onChange={(e) => setCarbsGrams(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-f" className="text-xs font-semibold text-[var(--muted)]">
                    Fat (g)
                  </label>
                  <input
                    id="f-f"
                    type="number"
                    min={0}
                    step="any"
                    value={fatGrams}
                    onChange={(e) => setFatGrams(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="f-fi" className="text-xs font-semibold text-[var(--muted)]">
                    Fiber (g)
                  </label>
                  <input
                    id="f-fi"
                    type="number"
                    min={0}
                    step="any"
                    value={fiberGrams}
                    onChange={(e) => setFiberGrams(e.target.value)}
                    className="w-full min-h-[42px] px-3 py-2 rounded-[12px] border border-[var(--line)] bg-[var(--surface2)] text-sm text-[var(--ink)]"
                  />
                </div>
              </div>

              {formErrors.submit && (
                <p className="text-xs font-medium text-[var(--bad)]" role="alert">
                  {formErrors.submit}
                </p>
              )}

              <div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="min-h-[42px] px-[18px] py-2 rounded-[12px] hhj-btn-primary text-sm font-semibold cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Saving...' : `Add to ${formatShortDate(selectedDate)}`}
                </button>
              </div>
            </form>
          </section>
        </div>

        {/* Right: Guidance & 7-day Chart */}
        <div className="flex flex-col gap-5">
          <section className="hhj-card-flat p-4 sm:p-5 lg:p-[22px]">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-[var(--plum-soft)] text-[var(--plum)]">
              Hormone-supportive guidance
            </span>
            <h3 className="font-display font-bold text-lg text-[var(--ink)] mt-2.5 mb-1.5">
              Eating with your cycle
            </h3>
            <p className="text-sm text-[var(--muted)] leading-relaxed">
              Balanced protein, fiber-rich complex carbohydrates, and healthy omega-3 fats help support insulin sensitivity and steadier energy across phases.
            </p>
            <ul className="mt-3 space-y-1 text-xs text-[var(--ink)]">
              <li>· Leafy greens (spinach, kale, arugula)</li>
              <li>· Omega-3 sources (salmon, walnuts, flax seeds)</li>
              <li>· Slow-digesting carbs (oats, quinoa, lentils)</li>
            </ul>
            <p className="text-xs text-[var(--muted)] mt-3">General guidance, not a clinical diet plan.</p>
          </section>

          <section className="hhj-card p-4 sm:p-5 lg:p-[22px]">
            <header className="mb-4">
              <h2 className="font-display font-bold text-[1.25rem] text-[var(--ink)]">
                Last 7 days
              </h2>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Calories logged over the last 7 days. Dashed line marks your target.
              </p>
            </header>

            {weeklyTotals.length > 0 ? (
              <svg
                viewBox="0 0 560 190"
                className="w-full h-auto block overflow-visible"
                role="img"
                aria-label="Calories over the last 7 days"
              >
                <line x1="6" x2="554" y1="164" y2="164" stroke="var(--line)" />
                {targets.calories > 0 && (
                  <line
                    x1="6"
                    x2="554"
                    y1={164 - (targets.calories / maxWeeklyKcal) * 140}
                    y2={164 - (targets.calories / maxWeeklyKcal) * 140}
                    stroke="var(--muted)"
                    strokeDasharray="4 5"
                    opacity="0.7"
                  />
                )}
                {weeklyTotals.map((day, idx) => {
                  const n = weeklyTotals.length;
                  const iw = 548;
                  const bw = Math.min(54, (iw / n) * 0.62);
                  const cx = 6 + (iw / n) * (idx + 0.5);
                  const bh = Math.max(0, (day.calories / maxWeeklyKcal) * 140);
                  const y = 164 - bh;
                  const isLast = idx === n - 1;
                  return (
                    <g key={day.date}>
                      <rect
                        x={(cx - bw / 2).toFixed(1)}
                        y={y.toFixed(1)}
                        width={bw.toFixed(1)}
                        height={bh.toFixed(1)}
                        rx="7"
                        fill={isLast ? 'var(--plum)' : 'var(--bar)'}
                      />
                      {day.calories > 0 && (
                        <text
                          x={cx.toFixed(1)}
                          y={(y - 6).toFixed(1)}
                          textAnchor="middle"
                          className="text-[11px] font-semibold fill-[var(--muted)]"
                        >
                          {day.calories}
                        </text>
                      )}
                      <text
                        x={cx.toFixed(1)}
                        y="183"
                        textAnchor="middle"
                        className="text-[11px] font-semibold fill-[var(--muted)]"
                      >
                        {day.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            ) : (
              <EmptyStateCard
                title="No meal history yet"
                description="Past daily totals will appear here once meals are logged."
              />
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
