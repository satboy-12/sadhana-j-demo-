export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  memberSince?: string;
  accountTier?: string;
}

export interface AuthResponse {
  token: string;
  tokenType?: string;
  user: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export interface PeriodRecord {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  flowIntensity: 'Spotting' | 'Light' | 'Moderate' | 'Heavy';
  symptoms: string[];
  notes?: string;
  cycleLengthDays?: number;
}

export interface PeriodEstimate {
  nextPeriodStart: string;
  nextPeriodEnd: string;
  fertileWindowStart: string;
  fertileWindowEnd: string;
  ovulationDate: string;
  currentCycleDay: number | null;
  currentPhase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Uncharted';
  averageCycleLength: number | null;
  regularityScore: number | null;
}

export interface PcosSymptomLog {
  id: string;
  date: string; // YYYY-MM-DD
  symptoms: string[];
  severity: number; // 1 - 5
  painLevel: number; // 0 - 10
  energyLevel: number; // 1 - 5
  observations: string;
  createdAt?: string;
}

export type MoodOption = 'Radiant' | 'Calm' | 'Fatigued' | 'Anxious' | 'Low';
export type SleepQualityOption = 'Restless' | 'Good/Restful' | 'Deep/Healing';

export interface WellnessEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mood: MoodOption;
  sleepHours: number;
  sleepQuality: SleepQualityOption;
  stressLevel: number; // 1 - 10
  notes: string;
  createdAt?: string;
}

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snacks';

export interface NutritionMealItem {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealCategory;
  foodName: string;
  portion: string;
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
  loggedTime?: string;
}

export interface NutritionTargets {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams: number;
}

export interface NutritionSummaryResponse {
  date: string;
  targets: NutritionTargets;
  meals: NutritionMealItem[];
  weeklyTotals: Array<{
    date: string;
    label: string;
    calories: number;
    status: string;
  }>;
}

export interface WaterIntakeRecord {
  id: string;
  date: string; // YYYY-MM-DD
  amountMl: number;
  loggedAt: string;
}

export interface WaterTrackerResponse {
  date: string;
  dailyTargetMl: number;
  totalIntakeMl: number;
  remindersEnabled: boolean;
  entries: WaterIntakeRecord[];
  weeklyHistory: Array<{
    date: string;
    dayLabel: string;
    totalMl: number;
  }>;
}

export type JournalCategory =
  | 'General Reflection'
  | 'PCOS Symptom Log'
  | 'Cycle Tracking'
  | 'Nutrition & Diet'
  | 'Mental Wellness';

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  category: JournalCategory;
  entryDate: string; // ISO datetime string
  updatedAt?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  phoneNumber: string;
  memberSince?: string;
  accountTier?: string;
  twoFactorEnabled?: boolean;
  passwordLastChanged?: string;
  preferences: {
    cycleReminders: boolean;
    medicationAlerts: boolean;
    hydrationNudges: boolean;
    dailyCalorieTarget?: number;
    dailyWaterTargetMl?: number;
  };
}

export interface DashboardSummary {
  userName: string;
  cycleSummary: {
    currentDay: number | null;
    phase: string;
    daysUntilNextPeriod: number | null;
    nextPeriodDate: string | null;
    fertilityStatus: string | null;
    averageCycleLength: number | null;
    cycleHistory: Array<{
      month: string;
      lengthDays: number;
    }>;
  };
  wellnessSummary: {
    mood: string | null;
    sleepHours: number | null;
    energyLevel: string | null;
    insight: string | null;
  };
  waterSummary: {
    intakeMl: number;
    targetMl: number;
  };
  latestSymptom: PcosSymptomLog | null;
  nutritionSummary: {
    caloriesConsumed: number;
    caloriesTarget: number;
    antiInflammatoryScore: number | null;
    sugarStatus: string | null;
  };
  recentJournalEntries: JournalEntry[];
}
