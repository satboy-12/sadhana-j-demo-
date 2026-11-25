# Her Health Journey — Web Application

A women's health tracking platform built with React, TypeScript, Tailwind CSS, React Router, Firebase Authentication (Email & Password), and Cloud Firestore.

## Features & Pages

1. **Home (`/`)** — Cinematic brand opening, overview of the six health modules, privacy & ownership guarantee, and authentication actions.
2. **Login (`/login`)** — Firebase Email & Password sign-in with validation, password visibility toggle, and clear Firebase Auth error feedback.
3. **Registration (`/register`)** — Full name, email, password strength indicator, confirm password matching validation, and email verification workflow.
4. **Dashboard (`/dashboard`)** — Cycle overview, recent PCOS symptoms, mood & wellness summary, nutrition summary, water intake tracker, journal history, and cycle length chart backed by Cloud Firestore.
5. **Period Tracker (`/period-tracker`)** — Interactive monthly calendar, period start/end date logging, edit and delete operations, cycle history table, average cycle length, and approximate phase/next-period estimates.
6. **PCOS Symptom Tracker (`/pcos-tracker`)** — Symptom selection, 1–5 severity scale, pain level (0–10), energy level (1–5), personal observations, and longitudinal trend chart.
7. **Mood & Wellness (`/wellness`)** — Mood state selector, sleep duration slider, sleep quality rating, stress index (1–10), daily notes, and weekly rhythm chart.
8. **Nutrition & Diet (`/nutrition`)** — Daily calorie & macronutrient progress, Breakfast/Lunch/Dinner/Snacks food diary, quick-fill presets, and 7-day history.
9. **Water Tracker (`/water`)** — Editable daily water target, quick-add intake controls, SVG progress ring, hydration reminder preference toggle, and historical records.
10. **Health Journal (`/journal`)** — Create, edit, and delete entries, live keyword search, category filtering, and date-ordered history.
11. **Profile (`/profile`)** — Personal details, notification preferences, JSON profile export, account deletion confirmation, and logout.

## Architecture & Firebase Configuration

- **Authentication**: Firebase Authentication using Email & Password (`firebase/auth`) with email verification enforced before reading or writing user health records.
- **Database**: Cloud Firestore (`firebase/firestore`) configured via `firebase-applet-config.json` and protected by `firestore.rules`.

## Local Development

```bash
npm install
npm run dev
```

## Unit Tests & Security Rules Validation

```bash
npx eslint firestore.rules
npx --yes tsx --test src/utils/validation.test.ts src/utils/healthCalculations.test.ts src/utils/uiHelpers.test.ts src/utils/introStorage.test.ts
```

## Build & Production Deployment

```bash
npx tsc --noEmit
npm run lint
npm run build
```
