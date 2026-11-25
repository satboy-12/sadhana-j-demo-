import type { UserProfile } from '../types/api';
import { BLUEPRINT_LIMITS, BLUEPRINT_PATTERNS, sanitizeBoundedText } from '../utils/validation';

export const DEFAULT_CALORIE_TARGET = 2000;
export const DEFAULT_WATER_TARGET_ML = 2500;

export interface MinimalAuthUserInfo {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  metadata?: {
    creationTime?: string;
  };
}

export function deriveDisplayName(
  fbUser: MinimalAuthUserInfo,
  preferredFullName?: string,
): string {
  const email = (fbUser.email || '').trim();
  const emailPrefix = email.includes('@') ? email.split('@')[0] : email;
  const candidate =
    preferredFullName?.trim() || fbUser.displayName?.trim() || emailPrefix || 'Member';
  return candidate.slice(0, BLUEPRINT_LIMITS.FULL_NAME_MAX) || 'Member';
}

export function buildInitialUserAccountRecord(
  fbUser: MinimalAuthUserInfo,
  preferredFullName?: string,
  nowIso = new Date().toISOString(),
) {
  const memberSince = fbUser.metadata?.creationTime
    ? new Date(fbUser.metadata.creationTime).toISOString().slice(0, 10)
    : nowIso.slice(0, 10);

  return {
    userId: fbUser.uid,
    fullName: deriveDisplayName(fbUser, preferredFullName),
    memberSince: memberSince.slice(0, 40),
    accountTier: 'Firebase Cloud' as const,
    cycleReminders: true,
    medicationAlerts: true,
    hydrationNudges: true,
    dailyCalorieTarget: DEFAULT_CALORIE_TARGET,
    dailyWaterTargetMl: DEFAULT_WATER_TARGET_ML,
  };
}

export function buildInitialPrivateProfileRecord(
  fbUser: MinimalAuthUserInfo,
) {
  const rawEmail = sanitizeBoundedText(fbUser.email || '', BLUEPRINT_LIMITS.EMAIL_MAX);
  const safeEmail = BLUEPRINT_PATTERNS.EMAIL.test(rawEmail)
    ? rawEmail
    : `${fbUser.uid}@users.herhealthjourney.app`.slice(0, BLUEPRINT_LIMITS.EMAIL_MAX);

  return {
    userId: fbUser.uid,
    email: safeEmail,
    dateOfBirth: '',
    phoneNumber: '',
  };
}

export function mapFirestoreDocsToUserProfile(
  uid: string,
  accountData: Record<string, unknown>,
  privateData: Record<string, unknown>,
  fbUser?: MinimalAuthUserInfo | null,
): UserProfile {
  return {
    id: uid,
    fullName: String(
      accountData.fullName || fbUser?.displayName || fbUser?.email?.split('@')[0] || 'Member',
    ),
    email: String(privateData.email || fbUser?.email || ''),
    dateOfBirth: String(privateData.dateOfBirth || ''),
    phoneNumber: String(privateData.phoneNumber || ''),
    memberSince: String(accountData.memberSince || new Date().toISOString().slice(0, 10)),
    accountTier: String(accountData.accountTier || 'Firebase Cloud'),
    twoFactorEnabled: false,
    preferences: {
      cycleReminders:
        accountData.cycleReminders !== undefined ? Boolean(accountData.cycleReminders) : true,
      medicationAlerts:
        accountData.medicationAlerts !== undefined ? Boolean(accountData.medicationAlerts) : true,
      hydrationNudges:
        accountData.hydrationNudges !== undefined ? Boolean(accountData.hydrationNudges) : true,
      dailyCalorieTarget: Number(accountData.dailyCalorieTarget ?? DEFAULT_CALORIE_TARGET),
      dailyWaterTargetMl: Number(accountData.dailyWaterTargetMl ?? DEFAULT_WATER_TARGET_ML),
    },
  };
}
