/**
 * HER HEALTH JOURNEY - MYSQL TO FIREBASE MIGRATION UTILITY
 * 
 * Maps existing MySQL records into Firebase Authentication and Realtime Database:
 * 
 * MySQL Table           -> Firebase Realtime Database Path
 * -------------------------------------------------------------
 * users                 -> users/{uid}/profile
 * period_records        -> users/{uid}/periods/{recordId}
 * symptom_records       -> users/{uid}/symptoms/{recordId}
 * wellness_records      -> users/{uid}/wellness/{recordId}
 * nutrition_records     -> users/{uid}/nutrition/{recordId}
 * water_records         -> users/{uid}/water/{recordId}
 * journal_entries       -> users/{uid}/journal/{recordId}
 *
 * Usage:
 * 1. Export MySQL records as JSON or CSV using mysqldump / sql queries:
 *    SELECT * FROM users INTO OUTFILE '/tmp/users.csv';
 * 2. Set service account key: export GOOGLE_APPLICATION_CREDENTIALS="serviceAccountKey.json"
 * 3. Run: node scripts/migrate_mysql_to_firebase.js
 */

console.log('HER HEALTH JOURNEY Firebase Migration Utility');
console.log('Project ID: gen-lang-client-0665837098');
console.log('Realtime Database URL: https://gen-lang-client-0665837098-default-rtdb.firebaseio.com');

export function mapUserToFirebaseProfile(mysqlUser) {
  return {
    fullName: `${mysqlUser.first_name || ''} ${mysqlUser.last_name || ''}`.trim() || mysqlUser.username,
    email: mysqlUser.email,
    dateOfBirth: mysqlUser.date_of_birth || null,
    createdAt: mysqlUser.created_at || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    profileImage: null,
    accountTier: 'Firebase Cloud',
    memberSince: (mysqlUser.created_at || new Date().toISOString()).slice(0, 10),
  };
}

export function mapPeriodRecordToFirebase(row) {
  return {
    startDate: row.start_date,
    endDate: row.end_date,
    cycleLength: row.cycle_length_days || 28,
    cycleLengthDays: row.cycle_length_days || 28,
    flowIntensity: row.flow_intensity || 'Moderate',
    notes: row.notes || '',
    symptoms: row.symptoms ? JSON.parse(row.symptoms) : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapSymptomRecordToFirebase(row) {
  return {
    date: row.record_date,
    symptoms: [row.symptom_type].filter(Boolean),
    severity: Number(row.severity_scale) || 3,
    painLevel: Number(row.pain_level) || 0,
    energyLevel: Number(row.energy_level) || 3,
    observations: row.daily_observations || '',
    notes: row.daily_observations || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapWellnessRecordToFirebase(row) {
  return {
    date: row.record_date,
    mood: row.mood || 'Calm',
    sleepHours: Number(row.sleep_hours) || 7,
    sleepQuality: row.sleep_quality ? (row.sleep_quality >= 4 ? 'Deep/Healing' : 'Good/Restful') : 'Good/Restful',
    stressLevel: Number(row.stress_level) || 3,
    notes: row.wellness_notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapNutritionRecordToFirebase(row) {
  return {
    date: row.record_date,
    meals: row.meal_type || 'Breakfast',
    mealType: row.meal_type || 'Breakfast',
    foodItems: row.food_description || 'Meal',
    foodName: row.food_description || 'Meal',
    calories: Number(row.calories_estimate) || 0,
    notes: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

export function mapWaterRecordToFirebase(row) {
  return {
    date: row.record_date,
    amountMl: Number(row.amount_ml) || 0,
    goalMl: Number(row.daily_goal_ml) || 2500,
    updatedAt: row.created_at || new Date().toISOString(),
  };
}

export function mapJournalRecordToFirebase(row) {
  return {
    title: row.title || 'Journal Entry',
    content: row.content || '',
    mood: row.mood || 'General',
    date: row.entry_date || new Date().toISOString().slice(0, 10),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || new Date().toISOString(),
  };
}
