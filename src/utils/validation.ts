export const BLUEPRINT_LIMITS = {
  USER_ID_MAX: 128,
  FULL_NAME_MAX: 120,
  EMAIL_MAX: 254,
  PHONE_MAX: 30,
  DATE_LEN: 10,
  DATETIME_MAX: 40,
  TITLE_MAX: 120,
  CONTENT_MAX: 5000,
  NOTES_MAX: 2000,
  FOOD_NAME_MAX: 120,
  PORTION_MAX: 60,
  SYMPTOM_LIST_MAX: 20,
  SYMPTOM_ITEM_MAX: 60,
  WATER_MIN_ML: 1,
  WATER_MAX_ML: 5000,
  TARGET_MIN: 500,
  TARGET_MAX: 10000,
} as const;

export const BLUEPRINT_PATTERNS = {
  ID: /^[a-zA-Z0-9_-]{1,128}$/,
  ISO_DATE: /^\d{4}-\d{2}-\d{2}$/,
  ISO_DATETIME: /^\d{4}-\d{2}-\d{2}.*$/,
  EMAIL: /^[^@\s]+@[^@\s]+\.[^@\s]+$/,
} as const;

export function sanitizeBoundedText(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLen);
}

export function sanitizeSymptomList(list: unknown): string[] {
  if (!Array.isArray(list)) return [];
  return list
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim().slice(0, BLUEPRINT_LIMITS.SYMPTOM_ITEM_MAX))
    .filter(Boolean)
    .slice(0, BLUEPRINT_LIMITS.SYMPTOM_LIST_MAX);
}

export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tone: 'neutral' | 'error' | 'secondary' | 'tertiary';
}

export function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) {
    return 'Email address is required.';
  }
  if (trimmed.length > BLUEPRINT_LIMITS.EMAIL_MAX || !BLUEPRINT_PATTERNS.EMAIL.test(trimmed)) {
    return 'Please enter a valid email address.';
  }
  return null;
}

export function validatePassword(password: string, minLength = 8): string | null {
  if (!password) {
    return 'Password is required.';
  }
  if (password.length < minLength) {
    return `Password must be at least ${minLength} characters.`;
  }
  return null;
}

export function evaluatePasswordStrength(password: string): PasswordStrengthResult {
  if (!password) {
    return {
      score: 0,
      label: 'Use 8+ characters with a mix of letters, numbers & symbols',
      tone: 'neutral',
    };
  }

  let score = 0;
  if (password.length >= 8) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  const clamped = Math.min(4, score) as 0 | 1 | 2 | 3 | 4;

  if (clamped < 2) {
    return { score: clamped, label: 'Weak password', tone: 'error' };
  }
  if (clamped < 4) {
    return { score: clamped, label: 'Moderate password strength', tone: 'secondary' };
  }
  return { score: clamped, label: 'Strong password', tone: 'tertiary' };
}

export function validateRegistrationForm(input: {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptedPrivacy: boolean;
}): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.fullName.trim() || input.fullName.trim().length < 2) {
    errors.fullName = 'Please enter your full name (at least 2 characters).';
  }

  const emailErr = validateEmail(input.email);
  if (emailErr) {
    errors.email = emailErr;
  }

  const passErr = validatePassword(input.password, 8);
  if (passErr) {
    errors.password = passErr;
  }

  if (input.confirmPassword !== input.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  if (!input.acceptedPrivacy) {
    errors.acceptedPrivacy = 'You must agree to the privacy policy to continue.';
  }

  return errors;
}

export function validatePeriodDates(startDate: string, endDate: string): string | null {
  if (!startDate) {
    return 'Period start date is required.';
  }
  if (!endDate) {
    return 'Period end date is required.';
  }
  const start = new Date(`${startDate}T00:00:00Z`);
  const end = new Date(`${endDate}T00:00:00Z`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Invalid date format.';
  }
  if (end < start) {
    return 'End date cannot be earlier than start date.';
  }
  const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (diffDays > 21) {
    return 'Logged period duration exceeds 21 days. Please verify dates.';
  }
  return null;
}

export function validateMealInput(input: {
  foodName: string;
  portion: string;
  calories: number;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!input.foodName.trim()) {
    errors.foodName = 'Food name is required.';
  }
  if (!input.portion.trim()) {
    errors.portion = 'Portion size is required.';
  }
  if (!Number.isFinite(input.calories) || input.calories < 0 || input.calories > 5000) {
    errors.calories = 'Calories must be between 0 and 5,000 kcal.';
  }
  return errors;
}

export function validateJournalInput(input: {
  title: string;
  content: string;
  entryDate: string;
}): Record<string, string> {
  const errors: Record<string, string> = {};
  const trimmedTitle = input.title.trim();
  const trimmedContent = input.content.trim();
  if (!trimmedTitle) {
    errors.title = 'Journal title is required.';
  } else if (trimmedTitle.length > BLUEPRINT_LIMITS.TITLE_MAX) {
    errors.title = `Journal title must be ${BLUEPRINT_LIMITS.TITLE_MAX} characters or fewer.`;
  }
  if (!trimmedContent) {
    errors.content = 'Journal reflection content cannot be empty.';
  } else if (trimmedContent.length > BLUEPRINT_LIMITS.CONTENT_MAX) {
    errors.content = `Journal content must be ${BLUEPRINT_LIMITS.CONTENT_MAX} characters or fewer.`;
  }
  if (!input.entryDate) {
    errors.entryDate = 'Entry date and time is required.';
  }
  return errors;
}
