import {
  firebaseDashboardService,
  firebaseJournalService,
  firebaseNutritionService,
  firebasePeriodsService,
  firebaseProfileService,
  firebaseSymptomsService,
  firebaseWaterService,
  firebaseWellnessService,
} from './firebaseData';
import type {
  JournalEntry,
  NutritionMealItem,
  PcosSymptomLog,
  PeriodRecord,
  UserProfile,
  WellnessEntry,
} from '../types/api';

export const dashboardService = {
  getSummary: () => firebaseDashboardService.getSummary(),
};

export const periodsService = {
  list: () => firebasePeriodsService.list(),
  create: (payload: Omit<PeriodRecord, 'id'>) => firebasePeriodsService.create(payload),
  update: (id: string, payload: Omit<PeriodRecord, 'id'>) =>
    firebasePeriodsService.update(id, payload),
  remove: (id: string) => firebasePeriodsService.remove(id),
};

export const symptomsService = {
  list: () => firebaseSymptomsService.list(),
  create: (payload: Omit<PcosSymptomLog, 'id'>) => firebaseSymptomsService.create(payload),
  remove: (id: string) => firebaseSymptomsService.remove(id),
};

export const wellnessService = {
  list: () => firebaseWellnessService.list(),
  create: (payload: Omit<WellnessEntry, 'id'>) => firebaseWellnessService.create(payload),
};

export const nutritionService = {
  getSummary: (date?: string) => firebaseNutritionService.getSummary(date),
  createMeal: (payload: Omit<NutritionMealItem, 'id'>) =>
    firebaseNutritionService.createMeal(payload),
  removeMeal: (id: string) => firebaseNutritionService.removeMeal(id),
};

export const waterService = {
  getStatus: (date?: string) => firebaseWaterService.getStatus(date),
  logIntake: (payload: { date: string; amountMl: number }) =>
    firebaseWaterService.logIntake(payload),
  updatePreferences: (payload: { dailyTargetMl?: number; remindersEnabled?: boolean }) =>
    firebaseWaterService.updatePreferences(payload),
};

export const journalService = {
  list: (query?: string) => firebaseJournalService.list(query),
  create: (payload: Omit<JournalEntry, 'id'>) => firebaseJournalService.create(payload),
  update: (id: string, payload: Omit<JournalEntry, 'id'>) =>
    firebaseJournalService.update(id, payload),
  remove: (id: string) => firebaseJournalService.remove(id),
};

export const profileService = {
  get: () => firebaseProfileService.get(),
  update: (payload: Partial<UserProfile>) => firebaseProfileService.update(payload),
  deleteAccount: () => firebaseProfileService.deleteAccount(),
};
