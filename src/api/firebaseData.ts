// Unified Cloud Firestore facade for all web health modules and profile provisioning.
// Delegates directly to the hardened Firestore service implementations in src/services/.
export { ensureUserAccountAndProfile } from '../services/authService';
export { periodsService as firebasePeriodsService } from '../services/periodService';
export { symptomsService as firebaseSymptomsService } from '../services/symptomService';
export { wellnessService as firebaseWellnessService } from '../services/wellnessService';
export { nutritionService as firebaseNutritionService } from '../services/nutritionService';
export { waterService as firebaseWaterService } from '../services/waterService';
export { journalService as firebaseJournalService } from '../services/journalService';
export { profileService as firebaseProfileService } from '../services/profileService';
export { dashboardService as firebaseDashboardService } from '../services/dashboardService';
