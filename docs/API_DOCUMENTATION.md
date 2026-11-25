# HER HEALTH JOURNEY – REST API Documentation

Base URL: `https://her-health-journey.onrender.com/api` (Production) / `http://localhost:8080/api` (Local)

Interactive Swagger UI: `/swagger-ui.html`
OpenAPI Specification: `/v3/api-docs`

---

## Authentication Endpoints

### 1. Register User
`POST /api/auth/register`
```json
{
  "username": "sophia_j",
  "email": "sophia@example.com",
  "password": "SecurePassword123!",
  "firstName": "Sophia",
  "lastName": "Jenkins",
  "dateOfBirth": "1996-05-14"
}
```
**Response (201 Created)**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "userId": 1,
  "username": "sophia_j",
  "email": "sophia@example.com",
  "firstName": "Sophia",
  "lastName": "Jenkins"
}
```

### 2. Login User
`POST /api/auth/login`
```json
{
  "usernameOrEmail": "sophia_j",
  "password": "SecurePassword123!"
}
```

---

## Health Check Endpoint
`GET /api/health`
**Response (200 OK)**:
```json
{
  "status": "UP",
  "application": "HER HEALTH JOURNEY"
}
```

---

## Unified Dashboard Endpoint
`GET /api/dashboard` (Headers: `Authorization: Bearer <token>`)
**Response (200 OK)**:
```json
{
  "userProfile": {
    "id": 1,
    "username": "sophia_j",
    "email": "sophia@example.com",
    "firstName": "Sophia",
    "lastName": "Jenkins",
    "dateOfBirth": "1996-05-14"
  },
  "periodSummary": {
    "averageCycleLengthDays": 28,
    "averagePeriodDurationDays": 5,
    "estimatedNextPeriodStart": "2026-12-15",
    "medicalDisclaimer": "Cycle calculation is an estimate derived from your logged history. It is for tracking purposes only and not a medical prediction."
  },
  "waterProgress": {
    "date": "2026-11-23",
    "currentAmountMl": 1500,
    "dailyGoalMl": 2000,
    "percentageCompleted": 75,
    "goalReached": false
  },
  "latestWellness": {
    "id": 1,
    "recordDate": "2026-11-23",
    "mood": "Calm & Grounded",
    "sleepHours": 7.50,
    "sleepQuality": 4,
    "stressLevel": 2,
    "wellnessNotes": "15 min meditation"
  },
  "recentSymptoms": [
    {
      "id": 1,
      "recordDate": "2026-11-23",
      "symptomType": "Pelvic Pain & Cramping",
      "severityScale": 3,
      "painLevel": 3,
      "energyLevel": 3,
      "dailyObservations": "Mild cramping"
    }
  ],
  "cyclePhaseAdvice": "Nurture your body with gentle hydration, balanced whole foods, and restorative rest."
}
```

---

## Period Tracker Endpoints
- `GET /api/period` - List all periods (Optional: `?startDate=2026-01-01&endDate=2026-12-31`)
- `GET /api/period/summary` - Cycle calculation and next estimated period date
- `POST /api/period` - Log new cycle
- `PUT /api/period/{id}` - Update cycle
- `DELETE /api/period/{id}` - Delete cycle

## PCOS Symptom Tracker Endpoints
- `GET /api/symptoms` - List symptoms
- `POST /api/symptoms` - Log symptom (Severity: 1-5, Pain: 0-10, Energy: 1-5)
- `PUT /api/symptoms/{id}` - Update symptom
- `DELETE /api/symptoms/{id}` - Delete symptom

## Mood & Wellness Endpoints
- `GET /api/wellness` - List daily wellness logs
- `POST /api/wellness` - Log mood, sleep, and stress
- `PUT /api/wellness/{id}` - Update wellness log
- `DELETE /api/wellness/{id}` - Delete wellness log

## Nutrition & Diet Endpoints
- `GET /api/nutrition` - List meal logs
- `POST /api/nutrition` - Log meal (BREAKFAST, LUNCH, DINNER, SNACK)
- `PUT /api/nutrition/{id}` - Update meal log
- `DELETE /api/nutrition/{id}` - Delete meal log

## Water Tracker Endpoints
- `GET /api/water` - List hydration records
- `GET /api/water/today` - Today's water progress and goal completion
- `POST /api/water` - Set water intake for date
- `POST /api/water/add/{amountMl}` - Quick increment today's intake
- `DELETE /api/water/{id}` - Delete water log

## Health Journal Endpoints
- `GET /api/journal` - List private journal entries
- `POST /api/journal` - Create personal reflection
- `PUT /api/journal/{id}` - Edit personal reflection
- `DELETE /api/journal/{id}` - Delete personal reflection

