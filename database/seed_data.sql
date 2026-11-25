-- ========================================================
-- HER HEALTH JOURNEY - SEED TEST DATA
-- Test user: demo_user / demo@herhealth.com
-- Password: Password123!
-- ========================================================

INSERT INTO users (username, email, password_hash, first_name, last_name, date_of_birth)
VALUES (
    'demo_user',
    'demo@herhealth.com',
    '$2a$12$4L1e9tC96n8Ff458tEw8uOqI4bCgI2i5v9C1l4P9w0B8FfG0k2P1e',
    'Sophia',
    'Jenkins',
    '1996-05-14'
) ON DUPLICATE KEY UPDATE id=id;

INSERT INTO period_records (user_id, start_date, end_date, flow_intensity, pain_level, notes)
VALUES 
(1, DATE_SUB(CURRENT_DATE, INTERVAL 56 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 51 DAY), 'MEDIUM', 4, 'Moderate cramps on day 1 and 2'),
(1, DATE_SUB(CURRENT_DATE, INTERVAL 28 DAY), DATE_SUB(CURRENT_DATE, INTERVAL 23 DAY), 'HEAVY', 6, 'Used warm heating pad, severe fatigue')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO symptom_records (user_id, record_date, symptom_type, severity_scale, pain_level, energy_level, daily_observations)
VALUES 
(1, CURRENT_DATE, 'Pelvic Pain & Bloating', 3, 4, 3, 'Mild pelvic tightness after afternoon walk.'),
(1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Fatigue & Acne Flare', 4, 2, 2, 'Cystic flare on jawline, sluggish afternoon.')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO wellness_records (user_id, record_date, mood, sleep_hours, sleep_quality, stress_level, wellness_notes)
VALUES 
(1, CURRENT_DATE, 'Calm', 7.50, 4, 2, 'Practiced 15 minutes of guided mindfulness.'),
(1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 'Anxious', 6.00, 2, 4, 'Woke up multiple times during night.')
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO nutrition_records (user_id, record_date, meal_type, food_description, calories_estimate)
VALUES 
(1, CURRENT_DATE, 'BREAKFAST', 'Oatmeal with chia seeds, blueberries, and almond milk', 380),
(1, CURRENT_DATE, 'LUNCH', 'Grilled salmon bowl with quinoa, avocado and spinach', 580)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO water_records (user_id, record_date, amount_ml, daily_goal_ml)
VALUES 
(1, CURRENT_DATE, 1500, 2000),
(1, DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), 2200, 2000)
ON DUPLICATE KEY UPDATE id=id;

INSERT INTO journal_entries (user_id, entry_date, title, content, is_private)
VALUES 
(1, CURRENT_DATE, 'Reflections on cycle wellness', 'Feeling significantly more in tune with my body this month. Herbal spearmint tea in the evening is helping alleviate inflammation.', TRUE)
ON DUPLICATE KEY UPDATE id=id;

