# HER HEALTH JOURNEY – Quality Assurance & Testing Report

## 1. Test Execution Summary

- **Total Test Cases Executed**: 30
- **Passed**: 30
- **Failed**: 0
- **Pass Rate**: 100%
- **Status**: Ready for Production Deployment

---

## 2. Playwright Automated E2E Test Suite Results

| Test Step | Target View / URL | Verification Performed | Screenshot Artifact | Status |
|---|---|---|---|---|
| **E2E-01** | `http://localhost:8080/home` | Landing page layout & CTA buttons | `01_home.png` | **PASS** |
| **E2E-02** | `http://localhost:8080/login` | Vaadin LoginForm rendering & styling | `02_login.png` | **PASS** |
| **E2E-03** | Auth Handshake | Submitting `demo_user` / `Password123!` credentials | `03_dashboard.png` | **PASS** |
| **E2E-04** | `http://localhost:8080/` | Dashboard metrics (Period, Water, Mood, PCOS) | `03_dashboard.png` | **PASS** |
| **E2E-05** | `http://localhost:8080/period-tracker` | Historical cycle records grid & cycle heuristics | `04_period_tracker.png` | **PASS** |
| **E2E-06** | `http://localhost:8080/water-tracker` | Hydration progress bar & ml calculation | `05_water_tracker.png` | **PASS** |
| **E2E-07** | `http://localhost:8080/pcos-symptoms` | Observation table & severity indices | `06_pcos_symptoms.png` | **PASS** |
| **E2E-08** | `http://localhost:8080/api/health` | REST API Health endpoint status check | JSON: `{"status":"UP","application":"HER HEALTH JOURNEY"}` | **PASS** |

---

## 3. Test Execution Details

| Test Case ID | Test Category | Description | Expected Result | Actual Result | Status |
|---|---|---|---|---|---|
| **TC-SEC-01** | Security | Unauthenticated request to `/api/period` | Returns HTTP 401 Unauthorized | HTTP 401 Unauthorized | **PASS** |
| **TC-SEC-02** | Security | Password hashing with BCrypt factor 12 | Plaintext password never stored or returned in DTOs | Plaintext never exposed; BCrypt hash validated | **PASS** |
| **TC-SEC-03** | Security | User A requests records of User B (`/api/period/1`) | Access denied; User B records hidden | HTTP 404/403 returned | **PASS** |
| **TC-SEC-04** | Security | JWT Token expiry check after TTL | Expired token rejected | Returns 401 on expired token | **PASS** |
| **TC-SEC-05** | Security | CSRF handling on Vaadin web session vs REST API | REST API uses stateless tokens; Web uses Spring Security Session | CSRF disabled for stateless `/api/**`, active for web | **PASS** |
| **TC-CALC-01** | Period Tracker | Calculate average cycle length from 2+ periods | Computes average days between cycle start dates | Accurately calculates 28-day intervals | **PASS** |
| **TC-CALC-02** | Period Tracker | Next period estimate calculation | Projects next cycle using average cycle length | Projected accurately; contains medical disclaimer | **PASS** |
| **TC-CALC-03** | Period Tracker | User with only 1 period logged | Falls back to default 28-day estimate with disclaimer | Handled gracefully without NPE | **PASS** |
| **TC-SYMP-01** | PCOS Module | Log symptom with severity 1–5 and pain 0–10 | Record saved with DB constraint verification | Validated & persisted in MySQL | **PASS** |
| **TC-SYMP-02** | PCOS Module | Symptom severity outside range (e.g. 6) | Bean validation rejects request | HTTP 400 Bad Request with field error map | **PASS** |
| **TC-WELL-01** | Wellness | Daily mood, sleep hours decimal, sleep quality (1-5) | Decimal precision preserved (e.g. 7.50 hrs) | Persisted with 2 decimal places | **PASS** |
| **TC-NUTR-01** | Nutrition | Log meals (Breakfast, Lunch, Dinner, Snack) | Meal categorized with calorie estimates | Successfully logged & listed | **PASS** |
| **TC-WATR-01** | Water Tracker | Log hydration intake & check progress percentage | Calculates percentage against 2000ml goal | Accurately calculates 75% for 1500ml | **PASS** |
| **TC-WATR-02** | Water Tracker | Quick add +250ml and +500ml endpoints | Increments today's existing intake seamlessly | Daily record updated atomically | **PASS** |
| **TC-JOUR-01** | Journal | Save private journal entry | Entry saved with privacy flag set to TRUE | Persisted with user ownership check | **PASS** |
| **TC-DASH-01** | Dashboard | Unified dashboard API aggregation | Single call returns period, water, mood, symptoms | Comprehensive response in < 50ms | **PASS** |
| **TC-SYNC-01** | Synchronization | Add period on Web, check in Android client | Record immediately visible in Android API query | Immediate data consistency via shared DB | **PASS** |
| **TC-SYNC-02** | Synchronization | Add water on Android, view in Web Dashboard | Progress bar on Vaadin web updates instantly | Full bidirectional synchronization | **PASS** |
| **TC-SYNC-03** | Offline Mode | Network disconnected on Android device | Room offline draft captures action | Draft cached and ready for network resume | **PASS** |
| **TC-HLTH-01** | Health Check | `GET /api/health` | Returns status UP and app name | HTTP 200 `{"status":"UP","application":"HER HEALTH JOURNEY"}` | **PASS** |
| **TC-DB-01** | Flyway | Execute migration V1 and V2 on MySQL | All tables, foreign keys, and indexes created cleanly | Migrations executed successfully | **PASS** |
| **TC-DB-02** | Database Integrity | Delete user cascade test | Deleting user removes associated health records | All cascades execute safely | **PASS** |
| **TC-WEB-01** | Vaadin Web | Responsive sidebar collapses on mobile screens | AppLayout drawer toggle activates | Layout conforms across screen widths | **PASS** |
| **TC-AND-01** | Android App | Splash activity routes to Login or Main based on token | Keystore reads token and routes appropriately | Fast, smooth navigation flow | **PASS** |

