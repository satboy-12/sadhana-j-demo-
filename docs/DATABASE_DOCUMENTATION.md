# HER HEALTH JOURNEY – Database Architecture & Specification

## 1. Engine & Configuration
- **Database Engine**: MySQL 8.0+ / InnoDB
- **Charset & Collation**: `utf8mb4` / `utf8mb4_unicode_ci`
- **Migration Framework**: Flyway (Versioned SQL migrations under `db/migration/`)
- **Connection Pool**: HikariCP (Max lifetime: 1800000ms, Minimum idle: 5, Maximum pool size: 20)

---

## 2. Relational Schema & Tables

### 2.1 `users`
Core identity table representing registered women in the application.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(50) | NOT NULL, UNIQUE | User login handle |
| `email` | VARCHAR(100) | NOT NULL, UNIQUE | Primary communication & login email |
| `password_hash` | VARCHAR(255) | NOT NULL | BCrypt salted hash (Work factor 12) |
| `first_name` | VARCHAR(50) | NOT NULL | Given name |
| `last_name` | VARCHAR(50) | NOT NULL | Surname |
| `date_of_birth` | DATE | NULL | Used for age calculations |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT CURRENT_TIMESTAMP | Account creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, ON UPDATE CURRENT_TIMESTAMP | Last profile update timestamp |

*Indexes*:
- `idx_users_email` ON (`email`)
- `idx_users_username` ON (`username`)

---

### 2.2 `period_records`
Tracks menstruation cycles, intensity, and associated physical symptoms.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Record identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `start_date` | DATE | NOT NULL | Cycle start date |
| `end_date` | DATE | NULL | Cycle end date |
| `flow_intensity` | ENUM | LIGHT, MEDIUM, HEAVY, SPOTTING | Categorized flow level |
| `pain_level` | INT | CHECK (0-10) | Cramp/pain intensity rating |
| `notes` | TEXT | NULL | Contextual user observations |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Record creation |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last record modification |

*Indexes*:
- `idx_period_user_start` ON (`user_id`, `start_date` DESC)

---

### 2.3 `symptom_records`
Specific telemetry for tracking Polycystic Ovary Syndrome (PCOS) symptoms over time.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Record identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `record_date` | DATE | NOT NULL | Observation date |
| `symptom_type` | VARCHAR(100) | NOT NULL | E.g., Hirsutism, Acne, Pelvic Cramping |
| `severity_scale` | INT | CHECK (1-5) | Severity score |
| `pain_level` | INT | CHECK (0-10) | Discomfort score |
| `energy_level` | INT | CHECK (1-5) | Energy/fatigue rating |
| `daily_observations` | TEXT | NULL | Freeform notes |

*Indexes*:
- `idx_symptoms_user_date` ON (`user_id`, `record_date` DESC)

---

### 2.4 `wellness_records`
Holistic mental and physical wellness, sleep telemetry, and stress tracking.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Record identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `record_date` | DATE | NOT NULL | Observation date |
| `mood` | VARCHAR(50) | NOT NULL | Happy, Calm, Anxious, Irritable, Low |
| `sleep_hours` | DECIMAL(4,2) | NOT NULL | Total sleep duration (e.g. 7.50 hrs) |
| `sleep_quality` | INT | CHECK (1-5) | Sleep restful rating |
| `stress_level` | INT | CHECK (1-5) | Perceived daily stress |
| `wellness_notes` | TEXT | NULL | Journal notes on mood/sleep |

*Indexes*:
- `idx_wellness_user_date` ON (`user_id`, `record_date` DESC)

---

### 2.5 `nutrition_records`
Structured meal records for dietary awareness.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Record identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `record_date` | DATE | NOT NULL | Meal date |
| `meal_type` | ENUM | BREAKFAST, LUNCH, DINNER, SNACK | Meal category |
| `food_description` | TEXT | NOT NULL | Meal breakdown |
| `calories_estimate` | INT | NULL | Approximate calorie count |

*Indexes*:
- `idx_nutrition_user_date` ON (`user_id`, `record_date` DESC)

---

### 2.6 `water_records`
Hydration tracking against individual daily hydration goals.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Record identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `record_date` | DATE | NOT NULL | Date |
| `amount_ml` | INT | CHECK (>= 0) | Logged water in millilitres |
| `daily_goal_ml` | INT | DEFAULT 2000 | Daily target (ml) |

*Indexes*:
- `idx_water_user_date` ON (`user_id`, `record_date` DESC)

---

### 2.7 `journal_entries`
Secure, private health reflections.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | BIGINT | PRIMARY KEY, AUTO_INCREMENT | Entry identifier |
| `user_id` | BIGINT | NOT NULL, FK -> users(id) ON DELETE CASCADE | Associated user |
| `entry_date` | DATE | NOT NULL | Entry date |
| `title` | VARCHAR(200) | NOT NULL | Entry headline |
| `content` | MEDIUMTEXT | NOT NULL | Full encrypted/private text |
| `is_private` | BOOLEAN | DEFAULT TRUE | Privacy flag |

*Indexes*:
- `idx_journal_user_date` ON (`user_id`, `entry_date` DESC)

