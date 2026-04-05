# 🌙 LUNA — Menstrual Cycle Tracker
### Cursor Project Specification · Full-Stack Web Application

---

> **How to use this file in Cursor:**
> Open this file in Cursor, then use `Cmd/Ctrl + L` to open the AI chat.
> Paste: *"Read this entire SPEC.md and build Phase 1 step by step. Do not skip any step. Ask me before starting Phase 2."*
> Work phase by phase — complete, test, and confirm each phase before proceeding.

---

## Table of Contents

1. [Project Summary](#1-project-summary)
2. [Tech Stack](#2-tech-stack)
3. [Folder Structure](#3-folder-structure)
4. [Database Schema](#4-database-schema)
5. [Core Algorithm Logic](#5-core-algorithm-logic)
6. [Phase 1 — Project Setup & Foundation](#phase-1--project-setup--foundation)
7. [Phase 2 — Period Logging Module](#phase-2--period-logging-module)
8. [Phase 3 — Cycle Computation Engine](#phase-3--cycle-computation-engine)
9. [Phase 4 — Dashboard & Phase Display](#phase-4--dashboard--phase-display)
10. [Phase 5 — Calendar View](#phase-5--calendar-view)
11. [Phase 6 — Prediction & Alert System](#phase-6--prediction--alert-system)
12. [Phase 7 — Symptom & Mood Tracker](#phase-7--symptom--mood-tracker)
13. [Phase 8 — Insights & Analytics](#phase-8--insights--analytics)
14. [Phase 9 — Notifications & PWA](#phase-9--notifications--pwa)
15. [Phase 10 — Settings, Export & Doctor Report](#phase-10--settings-export--doctor-report)
16. [UI Design System](#ui-design-system)
17. [Sample Data for Testing](#sample-data-for-testing)

---

## 1. Project Summary

**App Name:** Luna  
**Tagline:** *Your body's rhythm, understood.*

Luna is a privacy-first, offline-capable menstrual cycle tracker web application. It helps women and girls:

- Log period start dates and build a personal cycle history
- Understand the 4 phases of their ovarian cycle (Menstrual, Follicular, Ovulatory, Luteal)
- Identify the **Fertile Window** and **Ovulation Day** — for users trying to conceive
- Identify **Dangerous Days** for unprotected intercourse — for users practising Natural Family Planning (NFP)
- Receive **range-based period predictions** (not a single fixed date) derived from their own history
- Track symptoms, mood, energy, and sleep by cycle phase
- View analytics, trends, and health alerts over time

**Core Principle:** All predictions are computed from the user's OWN historical data. Population averages are only used as fallback defaults when history is insufficient (< 3 cycles).

---

## 2. Tech Stack

```
Frontend:     Next.js 14 (App Router) + TypeScript
Styling:      Tailwind CSS + shadcn/ui components
Charts:       Recharts
Database:     Prisma ORM + SQLite (local dev) → PostgreSQL (production)
Auth:         NextAuth.js v5 (email + Google OAuth)
State:        Zustand (client state) + TanStack Query (server state)
Forms:        React Hook Form + Zod validation
Offline:      next-pwa (service worker) + IndexedDB via idb library
Notifications: Web Push API (via web-push npm package)
Export:       jsPDF + ical.js
Hosting:      Vercel (recommended)
```

### Install commands

```bash
# Create project
npx create-next-app@latest luna --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
cd luna

# Core dependencies
npm install prisma @prisma/client
npm install next-auth@beta @auth/prisma-adapter
npm install zustand @tanstack/react-query
npm install react-hook-form zod @hookform/resolvers
npm install recharts
npm install idb
npm install jspdf jspdf-autotable
npm install ical.js
npm install web-push
npm install next-pwa
npm install date-fns

# shadcn/ui setup
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog sheet tabs badge calendar popover select toast alert

# Dev dependencies
npm install -D @types/web-push
```

---

## 3. Folder Structure

```
luna/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              ← Sidebar + nav wrapper
│   │   │   ├── page.tsx                ← Today / Dashboard
│   │   │   ├── calendar/page.tsx
│   │   │   ├── insights/page.tsx
│   │   │   ├── symptoms/page.tsx
│   │   │   └── settings/page.tsx
│   │   ├── api/
│   │   │   ├── auth/[...nextauth]/route.ts
│   │   │   ├── periods/route.ts        ← GET, POST
│   │   │   ├── periods/[id]/route.ts   ← PUT, DELETE
│   │   │   ├── symptoms/route.ts
│   │   │   ├── symptoms/[date]/route.ts
│   │   │   ├── predictions/route.ts    ← GET computed predictions
│   │   │   ├── export/pdf/route.ts
│   │   │   ├── export/ical/route.ts
│   │   │   └── push/subscribe/route.ts
│   │   ├── layout.tsx                  ← Root layout, providers
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── OverviewCards.tsx       ← 4 stat cards at top
│   │   │   ├── PhaseWheel.tsx          ← SVG radial cycle wheel
│   │   │   ├── PhaseTimeline.tsx       ← Phase cards with dates
│   │   │   ├── TodayBanner.tsx         ← Contextual daily message
│   │   │   └── NextPeriodCountdown.tsx
│   │   ├── calendar/
│   │   │   ├── CycleCalendar.tsx       ← Full month calendar
│   │   │   └── DayDetailSheet.tsx      ← Side panel on day click
│   │   ├── insights/
│   │   │   ├── TrendChart.tsx          ← Cycle length line chart
│   │   │   ├── StatsGrid.tsx
│   │   │   ├── SymptomHeatmap.tsx
│   │   │   └── HistoryTable.tsx
│   │   ├── symptoms/
│   │   │   ├── SymptomLogForm.tsx
│   │   │   └── SymptomHistory.tsx
│   │   ├── shared/
│   │   │   ├── AppSidebar.tsx
│   │   │   ├── MobileNavBar.tsx
│   │   │   ├── PhaseBadge.tsx          ← Colour-coded phase tag
│   │   │   ├── FertilityBadge.tsx      ← Safe / Caution / Danger
│   │   │   └── LoadingSpinner.tsx
│   │   └── providers/
│   │       ├── QueryProvider.tsx
│   │       ├── AuthProvider.tsx
│   │       └── ThemeProvider.tsx
│   │
│   ├── lib/
│   │   ├── cycle-engine.ts             ← ALL computation logic (pure functions)
│   │   ├── db.ts                       ← Prisma client singleton
│   │   ├── auth.ts                     ← NextAuth config
│   │   ├── push.ts                     ← Web push helpers
│   │   ├── export-pdf.ts               ← Doctor report generator
│   │   ├── export-ical.ts              ← Calendar file generator
│   │   ├── offline-store.ts            ← IndexedDB via idb
│   │   └── utils.ts                    ← Date helpers, formatters
│   │
│   ├── hooks/
│   │   ├── useCycleData.ts             ← Fetches periods + computes
│   │   ├── usePredictions.ts
│   │   ├── useSymptoms.ts
│   │   └── useNotifications.ts
│   │
│   ├── store/
│   │   └── useAppStore.ts              ← Zustand global store
│   │
│   └── types/
│       └── index.ts                    ← All shared TypeScript types
│
├── prisma/
│   ├── schema.prisma
│   └── seed.ts                         ← Seeds with sample data
│
├── public/
│   ├── icons/                          ← PWA icons (192x192, 512x512)
│   ├── manifest.json
│   └── sw.js                           ← Service worker (auto-generated)
│
├── SPEC.md                             ← This file
├── .env.local
└── next.config.js
```

---

## 4. Database Schema

### `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"          // Change to "postgresql" for production
  url      = env("DATABASE_URL")
}

// ─── AUTH TABLES (NextAuth) ──────────────────────────────────────────────────

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime
  @@unique([identifier, token])
}

// ─── APP TABLES ───────────────────────────────────────────────────────────────

model User {
  id                String        @id @default(cuid())
  name              String?
  email             String?       @unique
  emailVerified     DateTime?
  image             String?
  // App-specific profile
  dateOfBirth       DateTime?
  averageCycleLen   Int           @default(28)
  lutealPhaseLen    Int           @default(14)
  periodDuration    Int           @default(5)
  mode              String        @default("avoid")   // "ttc" | "avoid"
  notificationsOn   Boolean       @default(true)
  pushSubscription  String?       // JSON stringified push subscription
  theme             String        @default("light")   // "light" | "dark"
  createdAt         DateTime      @default(now())
  updatedAt         DateTime      @updatedAt
  // Relations
  accounts          Account[]
  sessions          Session[]
  periodLogs        PeriodLog[]
  symptomLogs       SymptomLog[]
}

model PeriodLog {
  id             String    @id @default(cuid())
  userId         String
  periodStart    DateTime
  periodEnd      DateTime?
  cycleLength    Int?      // Days since previous period start (computed on insert)
  flowIntensity  String    @default("moderate")  // "spotting" | "light" | "moderate" | "heavy"
  isAnomaly      Boolean   @default(false)        // true if gap > 45 days
  notes          String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  user           User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, periodStart])
}

model SymptomLog {
  id              String    @id @default(cuid())
  userId          String
  logDate         DateTime
  cycleDay        Int?      // Computed: day number in current cycle
  phase           String?   // "menstrual" | "follicular" | "ovulatory" | "luteal"
  // Physical
  cramps          Int?      // 0–10
  headache        Boolean   @default(false)
  bloating        Boolean   @default(false)
  nausea          Boolean   @default(false)
  backPain        Boolean   @default(false)
  breastTenderness Boolean  @default(false)
  // Emotional
  mood            String?   // "happy" | "neutral" | "sad" | "anxious" | "irritable"
  energyLevel     Int?      // 1–5
  anxietyLevel    Int?      // 1–5
  libido          Int?      // 1–5
  // Lifestyle
  sleepHours      Float?
  exercised       Boolean   @default(false)
  stressLevel     Int?      // 1–5
  waterIntake     Float?    // litres
  // Cycle-specific
  cervicalMucus   String?   // "dry" | "sticky" | "creamy" | "watery" | "egg-white"
  spotting        Boolean   @default(false)
  bbt             Float?    // Basal Body Temperature in °C
  ovulationPain   Boolean   @default(false)
  // Meta
  notes           String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  user            User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, logDate])
  @@index([userId, logDate])
}
```

---

## 5. Core Algorithm Logic

> **CRITICAL:** All computation lives in `src/lib/cycle-engine.ts` as **pure functions with no side effects**. This makes it fully testable and reusable on both client and server.

### `src/lib/cycle-engine.ts` — Complete Implementation

```typescript
import { differenceInDays, addDays, format, startOfDay } from 'date-fns';

// ─── TYPES ────────────────────────────────────────────────────────────────────

export type PhaseType = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type FertilityStatus = 'period' | 'safe' | 'approaching' | 'fertile' | 'peak' | 'safe-post';

export interface PeriodEntry {
  periodStart: Date;
  cycleLength?: number | null;
  isAnomaly?: boolean;
}

export interface CycleStats {
  average: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  count: number;
  regularity: 'very-regular' | 'regular' | 'slightly-irregular' | 'irregular' | 'very-irregular';
  trend: 'shortening' | 'stable' | 'lengthening';
  validCycles: number[];
}

export interface PhaseWindow {
  phase: PhaseType;
  label: string;
  startDate: Date;
  endDate: Date;
  startDay: number;
  endDay: number;
  color: string;
  icon: string;
  description: string;
  fertilityStatus: FertilityStatus;
}

export interface CyclePrediction {
  lastPeriod: Date;
  nextPeriodEarly: Date;   // based on min cycle
  nextPeriodAvg: Date;     // based on average cycle
  nextPeriodLate: Date;    // based on max cycle
  ovulationDate: Date;
  fertileWindowStart: Date;
  fertileWindowEnd: Date;
  cycleDay: number;        // today's day number in current cycle
  currentPhase: PhaseType;
  phases: PhaseWindow[];
  daysToNextPeriod: number;
  daysToOvulation: number;
  fertilityStatus: FertilityStatus;
}

export interface UserSettings {
  averageCycleLen: number;
  lutealPhaseLen: number;
  periodDuration: number;
  mode: 'ttc' | 'avoid';
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PHASE_COLORS: Record<PhaseType, string> = {
  menstrual:  '#c97b7b',
  follicular: '#7a9e8e',
  ovulatory:  '#d4955a',
  luteal:     '#9b8fc0',
};

const ANOMALY_THRESHOLD = 45; // days — gaps larger than this are likely missed entries

// ─── STEP 1: COMPUTE CYCLE STATISTICS ─────────────────────────────────────────

export function computeCycleStats(
  periods: PeriodEntry[],
  rollingWindow = 12
): CycleStats {
  // Sort ascending
  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
  );

  // Compute raw gaps between consecutive period starts
  const allGaps: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    const gap = differenceInDays(sorted[i].periodStart, sorted[i - 1].periodStart);
    allGaps.push(gap);
  }

  // Filter out anomalies (> 45 days = likely missed entry)
  const validGaps = allGaps.filter(g => g <= ANOMALY_THRESHOLD && g >= 15);

  // Apply rolling window (most recent N cycles)
  const windowGaps = validGaps.slice(-rollingWindow);

  if (windowGaps.length === 0) {
    // No valid data — return defaults
    return {
      average: 28, median: 28, min: 28, max: 28,
      stdDev: 0, count: 0, regularity: 'regular',
      trend: 'stable', validCycles: []
    };
  }

  const sum = windowGaps.reduce((a, b) => a + b, 0);
  const average = Math.round(sum / windowGaps.length);

  const sorted2 = [...windowGaps].sort((a, b) => a - b);
  const median = sorted2[Math.floor(sorted2.length / 2)];
  const min = sorted2[0];
  const max = sorted2[sorted2.length - 1];

  const variance = windowGaps.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / windowGaps.length;
  const stdDev = parseFloat(Math.sqrt(variance).toFixed(1));

  // Regularity classification
  let regularity: CycleStats['regularity'];
  if (stdDev < 2)      regularity = 'very-regular';
  else if (stdDev < 3) regularity = 'regular';
  else if (stdDev < 5) regularity = 'slightly-irregular';
  else if (stdDev < 7) regularity = 'irregular';
  else                 regularity = 'very-irregular';

  // Trend: compare last 3 cycles to previous 3
  let trend: CycleStats['trend'] = 'stable';
  if (windowGaps.length >= 6) {
    const recent = windowGaps.slice(-3);
    const older  = windowGaps.slice(-6, -3);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg  = older.reduce((a, b) => a + b, 0)  / older.length;
    const diff = recentAvg - olderAvg;
    if (diff <= -1.5)      trend = 'shortening';
    else if (diff >= 1.5)  trend = 'lengthening';
  }

  return { average, median, min, max, stdDev, count: windowGaps.length, regularity, trend, validCycles: windowGaps };
}

// ─── STEP 2: COMPUTE PHASE WINDOWS FOR A GIVEN CYCLE ──────────────────────────

export function computePhaseWindows(
  periodStart: Date,
  settings: UserSettings,
  stats: CycleStats
): PhaseWindow[] {
  const cycleLen = stats.average || settings.averageCycleLen;
  const luteal   = settings.lutealPhaseLen;
  const perdur   = settings.periodDuration;
  const ovDay    = cycleLen - luteal; // e.g. 28 - 14 = day 14

  const add = (days: number) => addDays(startOfDay(periodStart), days);

  return [
    {
      phase: 'menstrual',
      label: 'Menstrual Phase',
      startDate: add(0),
      endDate: add(perdur - 1),
      startDay: 1,
      endDay: perdur,
      color: PHASE_COLORS.menstrual,
      icon: '🩸',
      description: 'Your period. The uterine lining sheds. Rest, stay hydrated, and eat iron-rich foods.',
      fertilityStatus: 'period',
    },
    {
      phase: 'follicular',
      label: 'Follicular Phase',
      startDate: add(perdur),
      endDate: add(ovDay - 6),
      startDay: perdur + 1,
      endDay: ovDay - 5,
      color: PHASE_COLORS.follicular,
      icon: '🌱',
      description: 'Estrogen rises, follicles develop, energy increases. Great time to take on new challenges.',
      fertilityStatus: 'safe',
    },
    {
      phase: 'ovulatory',
      label: 'Fertile Window',
      startDate: add(ovDay - 5),
      endDate: add(ovDay + 1),
      startDay: ovDay - 4,
      endDay: ovDay + 1,
      color: PHASE_COLORS.ovulatory,
      icon: '🌸',
      description: `Ovulation occurs around day ${ovDay}. The egg is viable for 12–24 hours; sperm survive up to 5 days.`,
      fertilityStatus: 'fertile',
    },
    {
      phase: 'luteal',
      label: 'Luteal Phase',
      startDate: add(ovDay + 2),
      endDate: add(cycleLen - 1),
      startDay: ovDay + 2,
      endDay: cycleLen,
      color: PHASE_COLORS.luteal,
      icon: '🌙',
      description: 'Progesterone rises. PMS symptoms may appear in the second half. Body prepares for next cycle.',
      fertilityStatus: 'safe-post',
    },
  ];
}

// ─── STEP 3: COMPUTE FULL PREDICTION OBJECT ───────────────────────────────────

export function computePredictions(
  periods: PeriodEntry[],
  settings: UserSettings,
  today = new Date()
): CyclePrediction | null {
  if (periods.length === 0) return null;

  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
  );

  const stats = computeCycleStats(sorted);
  const lastPeriod = startOfDay(sorted[sorted.length - 1].periodStart);
  const todayStart = startOfDay(today);

  const cycleDay = differenceInDays(todayStart, lastPeriod) + 1;
  const cycleLen = stats.average;
  const luteal   = settings.lutealPhaseLen;
  const ovDay    = cycleLen - luteal;

  // Prediction range
  const nextPeriodAvg   = addDays(lastPeriod, cycleLen);
  const nextPeriodEarly = addDays(lastPeriod, stats.min  || cycleLen - 2);
  const nextPeriodLate  = addDays(lastPeriod, stats.max  || cycleLen + 3);

  // Ovulation & fertile window for current cycle
  const ovulationDate      = addDays(lastPeriod, ovDay - 1);
  const fertileWindowStart = addDays(lastPeriod, ovDay - 6);
  const fertileWindowEnd   = addDays(lastPeriod, ovDay);

  // Current phase
  let currentPhase: PhaseType = 'luteal';
  if (cycleDay <= settings.periodDuration)           currentPhase = 'menstrual';
  else if (cycleDay <= ovDay - 5)                    currentPhase = 'follicular';
  else if (cycleDay <= ovDay + 1)                    currentPhase = 'ovulatory';

  // Fertility status
  let fertilityStatus: FertilityStatus = 'safe';
  if (cycleDay <= settings.periodDuration)           fertilityStatus = 'period';
  else if (cycleDay === ovDay)                       fertilityStatus = 'peak';
  else if (cycleDay >= ovDay - 5 && cycleDay <= ovDay + 1) fertilityStatus = 'fertile';
  else if (cycleDay >= ovDay - 7 && cycleDay < ovDay - 5)  fertilityStatus = 'approaching';
  else if (cycleDay > ovDay + 1)                     fertilityStatus = 'safe-post';

  const phases = computePhaseWindows(lastPeriod, settings, stats);

  const daysToNextPeriod  = differenceInDays(nextPeriodAvg, todayStart);
  const daysToOvulation   = differenceInDays(ovulationDate, todayStart);

  return {
    lastPeriod,
    nextPeriodEarly,
    nextPeriodAvg,
    nextPeriodLate,
    ovulationDate,
    fertileWindowStart,
    fertileWindowEnd,
    cycleDay,
    currentPhase,
    phases,
    daysToNextPeriod,
    daysToOvulation,
    fertilityStatus,
  };
}

// ─── STEP 4: GET PHASE FOR ANY CALENDAR DATE ──────────────────────────────────

export function getPhaseForDate(
  date: Date,
  periods: PeriodEntry[],
  settings: UserSettings,
  stats: CycleStats
): { phase: PhaseType | 'predicted'; label: string; cycleDay: number } | null {
  const d = startOfDay(date);
  const sorted = [...periods].sort(
    (a, b) => a.periodStart.getTime() - b.periodStart.getTime()
  );

  const cycleLen = stats.average;
  const luteal   = settings.lutealPhaseLen;
  const ovDay    = cycleLen - luteal;

  // Check against each logged cycle
  for (let i = sorted.length - 1; i >= 0; i--) {
    const start   = startOfDay(sorted[i].periodStart);
    const cycleEnd = addDays(start, cycleLen - 1);

    if (d >= start && d <= cycleEnd) {
      const dayNum = differenceInDays(d, start) + 1;
      let phase: PhaseType;
      if (dayNum <= settings.periodDuration)           phase = 'menstrual';
      else if (dayNum <= ovDay - 5)                    phase = 'follicular';
      else if (dayNum <= ovDay + 1)                    phase = 'ovulatory';
      else                                             phase = 'luteal';

      const labels: Record<PhaseType, string> = {
        menstrual: 'Period', follicular: 'Follicular',
        ovulatory: 'Fertile / Ovulatory', luteal: 'Luteal'
      };
      return { phase, label: labels[phase], cycleDay: dayNum };
    }
  }

  // Check predicted next period
  if (sorted.length > 0) {
    const lastStart   = startOfDay(sorted[sorted.length - 1].periodStart);
    const predStart   = addDays(lastStart, cycleLen);
    const predEnd     = addDays(predStart, settings.periodDuration - 1);
    if (d >= predStart && d <= predEnd) {
      return { phase: 'predicted', label: 'Predicted Period', cycleDay: differenceInDays(d, predStart) + 1 };
    }
  }

  return null;
}

// ─── STEP 5: HEALTH ALERTS ────────────────────────────────────────────────────

export interface HealthAlert {
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string;
}

export function generateHealthAlerts(
  stats: CycleStats,
  periods: PeriodEntry[]
): HealthAlert[] {
  const alerts: HealthAlert[] = [];

  if (stats.count < 3) {
    alerts.push({
      severity: 'info',
      message: 'Log at least 3 period dates for accurate predictions.',
      recommendation: 'The more data you log, the more personalised your predictions become.',
    });
  }

  if (stats.average < 21 && stats.count >= 3) {
    alerts.push({
      severity: 'warning',
      message: 'Your average cycle is shorter than 21 days (polymenorrhea).',
      recommendation: 'Consult a gynaecologist to rule out hormonal imbalances.',
    });
  }

  if (stats.average > 35 && stats.count >= 3) {
    alerts.push({
      severity: 'warning',
      message: 'Your average cycle is longer than 35 days (oligomenorrhea).',
      recommendation: 'This can be associated with PCOS or thyroid issues. Consider speaking to a doctor.',
    });
  }

  if (stats.regularity === 'very-irregular') {
    alerts.push({
      severity: 'warning',
      message: 'Your cycles are highly irregular (standard deviation > 7 days).',
      recommendation: 'Natural Family Planning may not be reliable. Use additional contraception.',
    });
  }

  if (stats.trend === 'shortening') {
    alerts.push({
      severity: 'info',
      message: 'Your cycles have been getting shorter over the past 6 months.',
      recommendation: 'This is normal for some women, but worth mentioning to your doctor at your next visit.',
    });
  }

  return alerts;
}
```

---

## Phase 1 — Project Setup & Foundation

**Goal:** Working Next.js project with database, auth, and design system.

### Steps for Cursor:

**1.1 — Create the project and install all dependencies** (see Section 2 install commands)

**1.2 — Create `.env.local`:**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_VAPID_PUBLIC_KEY=""
VAPID_PRIVATE_KEY=""
VAPID_EMAIL="mailto:you@example.com"
```

**1.3 — Run Prisma setup:**
```bash
npx prisma init
# Replace schema with the schema from Section 4
npx prisma db push
npx prisma generate
```

**1.4 — Create `src/lib/db.ts`:**
```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ log: ['query'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**1.5 — Create `src/lib/auth.ts`** with NextAuth configured for Google + email providers, using Prisma adapter.

**1.6 — Create the design system in `src/app/globals.css`** using the CSS variables from Section 16.

**1.7 — Create root layout `src/app/layout.tsx`** wrapping with SessionProvider, QueryProvider, ThemeProvider, and Toaster.

**1.8 — Create `src/types/index.ts`** exporting all shared TypeScript interfaces.

**1.9 — Copy the full `cycle-engine.ts`** from Section 5 into `src/lib/cycle-engine.ts`.

**1.10 — Seed the database** with the sample data from Section 17 to enable immediate testing.

**✅ Phase 1 Complete when:** `npm run dev` runs, `/login` page loads, and `npx prisma studio` shows tables.

---

## Phase 2 — Period Logging Module

**Goal:** Users can add, edit, and delete period start dates. The API validates entries and computes cycle lengths on insert.

### API Routes

**`src/app/api/periods/route.ts`**
```typescript
// GET  → returns all period logs for authenticated user, sorted ascending
// POST → creates a new period log
//   Body: { periodStart: string (ISO date), flowIntensity?: string, notes?: string }
//   Logic on POST:
//     1. Fetch the most recent previous period for the user
//     2. Compute cycleLength = days between previous periodStart and new one
//     3. Set isAnomaly = true if cycleLength > 45
//     4. Save PeriodLog
//     5. Recompute and update user.averageCycleLen
//     6. Return the new log + updated predictions
```

**`src/app/api/periods/[id]/route.ts`**
```typescript
// PUT    → update flow intensity or notes only (cannot change date — delete and re-add)
// DELETE → delete a period log, then recompute averages
```

### Components

**`src/components/dashboard/LogPeriodButton.tsx`**
- Floating action button (bottom-right on mobile, sidebar button on desktop)
- Opens a Dialog/Sheet with `LogPeriodForm`

**`LogPeriodForm` fields:**
- Date picker (defaults to today)
- Flow intensity select: Spotting / Light / Moderate / Heavy
- Notes textarea (optional)
- Submit button: "Save Period"

**Validation (Zod):**
```typescript
const periodSchema = z.object({
  periodStart: z.string().refine(val => !isNaN(Date.parse(val)), 'Invalid date'),
  flowIntensity: z.enum(['spotting', 'light', 'moderate', 'heavy']).default('moderate'),
  notes: z.string().max(500).optional(),
});
```

**After successful save:**
- Show toast: "Period logged for [date] ✓"
- Invalidate all cycle-related queries (TanStack Query)
- Close the dialog

**✅ Phase 2 Complete when:** A user can log a period, see it appear in the history, and the database record is created correctly.

---

## Phase 3 — Cycle Computation Engine

**Goal:** Wire the computation engine to live data and expose predictions via a dedicated API route.

**`src/app/api/predictions/route.ts`**
```typescript
// GET → returns a CyclePrediction object for the authenticated user
// Logic:
//   1. Fetch all PeriodLogs for user
//   2. Fetch user settings (averageCycleLen, lutealPhaseLen, periodDuration, mode)
//   3. Call computePredictions(periods, settings) from cycle-engine.ts
//   4. Call computeCycleStats(periods) 
//   5. Call generateHealthAlerts(stats, periods)
//   6. Return { prediction, stats, alerts }
```

**`src/hooks/useCycleData.ts`**
```typescript
// Custom hook that:
//   - Calls /api/predictions with TanStack Query
//   - Returns { prediction, stats, alerts, isLoading, error }
//   - Refreshes every time a new period is logged (query invalidation)
```

**✅ Phase 3 Complete when:** `useCycleData()` returns a valid `CyclePrediction` object when called with sample data.

---

## Phase 4 — Dashboard & Phase Display

**Goal:** The main `/` page shows today's status, the phase wheel, and all phase windows.

### Page Layout (`src/app/(dashboard)/page.tsx`)

```
┌─────────────────────────────────────────────────────────┐
│  TodayBanner (contextual message based on phase)         │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│ Day of   │ Next     │ To Ovul- │ Cycle    │  (4 cards)  │
│ Cycle    │ Period   │ ation    │ Avg      │             │
├──────────┴──────────┴──────────┴──────────┴─────────────┤
│           ┌────────────────┐  ┌─────────────────────┐   │
│           │  Phase Wheel   │  │  Phase Timeline     │   │
│           │  (SVG radial)  │  │  (4 phase cards)    │   │
│           └────────────────┘  └─────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Components

**`OverviewCards.tsx`** — 4 stat cards:
1. **Day of Cycle** — e.g. "Day 11" / sub: "of 28-day cycle"
2. **Next Period** — e.g. "4 days" / sub: "Apr 9–13 (range)"
3. **Ovulation** — e.g. "3 days ago" or "In 5 days" / sub: "Day 14 of cycle"
4. **Cycle Length** — e.g. "28 days" / sub: "avg over 12 cycles"

**`PhaseWheel.tsx`** — SVG radial wheel:
- 4 coloured arc segments representing each phase
- Inner circle shows "Day X" text
- Animated needle pointing to current day position
- Ovulation day marked with a star/dot on the ring
- Today highlighted with a bold marker

**`PhaseTimeline.tsx`** — Phase cards list:
- One card per phase (Menstrual, Follicular, Ovulatory, Luteal)
- Each card shows: phase name, icon, date range, day range, description
- **TTC Mode:** Fertile window card has a green "BEST DAYS" badge
- **Avoid Mode:** Fertile window card has a red "⚠ HIGH RISK" badge
- Currently active phase card has an animated border glow + "NOW" badge
- Safe post-ovulation days show a green "LOWER RISK" badge

**`TodayBanner.tsx`** — Contextual messages:

| Condition | Icon | Title | Message |
|-----------|------|-------|---------|
| Period day | 🩸 | Period Day X | "Rest and take care of yourself today." |
| Fertile window | 🌸 | Fertile Window | TTC: "Great days to try to conceive." / Avoid: "High pregnancy risk — use protection." |
| Ovulation day | 🥚 | Ovulation Day | "Peak fertility today. Egg released." |
| Period in 3 days | 📅 | Period Approaching | "Your period is expected in ~3 days." |
| Luteal phase | 🌙 | Luteal Phase | "Progesterone is high. Period in ~X days." |
| Follicular | 🌱 | Follicular Phase | "Energy is building! Great week for new projects." |

**✅ Phase 4 Complete when:** Dashboard renders live data with correct phase, correct day number, and appropriate badges for both TTC and Avoid modes.

---

## Phase 5 — Calendar View

**Goal:** A full-month calendar at `/calendar` with colour-coded days showing all phases and predicted windows.

### Component: `CycleCalendar.tsx`

**Day cell colour coding:**
| Phase | Background | Text Colour | Border |
|-------|-----------|-------------|--------|
| Period | `#c97b7b` | white | none |
| Ovulation | `#d4955a` | white | bold |
| Fertile Window | `#fdf3e7` | `#d4955a` | 1px solid amber |
| Luteal | `#f0eef9` | `#9b8fc0` | 1px solid purple |
| Follicular | `#f0f7f4` | `#7a9e8e` | none |
| Predicted Period | `#fdf5f5` | `#c97b7b` | 1px dashed rose |
| Today | any | any | 2px solid currentPhaseColour |

**Calendar navigation:**
- Prev / Next month buttons
- "Today" button to jump back to current month
- Display 3 months forward (shows predicted phase windows)
- Month + Year header in Cormorant Garamond / serif display font

**Day click → `DayDetailSheet.tsx`:**
A side panel (shadcn Sheet) that slides in showing:
- Date heading
- Phase name + colour badge
- Day X of cycle
- Fertility status badge (Safe / Approaching / Fertile / Peak / Post-Ovulation)
- Symptoms logged that day (if any) with small icons
- "Log Symptoms" shortcut button

**✅ Phase 5 Complete when:** Calendar renders 3 months, all phase colours are correct, clicking a day opens the detail sheet.

---

## Phase 6 — Prediction & Alert System

**Goal:** Range-based period predictions displayed prominently, with a smart notification schedule.

### Prediction Display

Show as a range in the dashboard, not a single date:

```
Period expected:  Apr 3 – Apr 9
                  ←  likely range (min to max cycle) →
                       ↑ Apr 5 most likely (avg)
```

Show a confidence indicator:
- Standard deviation ≤ 2 days → "High confidence"
- Std dev 3–5 days → "Moderate confidence"  
- Std dev > 5 days → "Low confidence — cycle is irregular"

### Notification Schedule

Store the next notification state in the user record or a `Notification` table.

Trigger these notifications (via Web Push or in-app banner):

| Trigger | Message |
|---------|---------|
| 7 days before earliest predicted date | "Your period may arrive in about a week. Stock up on supplies." |
| 3 days before average predicted date | "Your period is approaching in ~3 days. Prepare." |
| Day of average predicted date | "Period expected today. Tap to log it when it starts." |
| 3 days after average date (if not logged) | "No period logged yet. Is it late?" |
| 7 days after average date (if not logged) | "Your period appears late. Consider a pregnancy test, or consult a doctor if concerned." |
| Fertile window starts (if Avoid mode) | "⚠ Your fertile window begins tomorrow. Use protection." |
| Fertile window starts (if TTC mode) | "🌸 Your fertile window starts tomorrow! Best days to try to conceive." |

### Late Period Handling
- If today > nextPeriodLate and no new period logged:
  - Show a prominent banner on dashboard: "Your period is late by X days."
  - Show option: [Log Period Now] [Mark as Irregular] [I might be pregnant]

**✅ Phase 6 Complete when:** Prediction range renders correctly, late period banner triggers, and at least in-app notification (toast) fires at the right time.

---

## Phase 7 — Symptom & Mood Tracker

**Goal:** Daily symptom logging at `/symptoms`, with the data linked to cycle phases.

### Symptom Log Form

Route: `/symptoms` — shows today's log form + recent history.

**Form sections:**

**Section 1 — Physical**
- Cramps: slider 0–10 (0 = none, 10 = severe)
- Symptoms checkboxes: Headache, Bloating, Nausea, Back Pain, Breast Tenderness, Fatigue, Acne

**Section 2 — Emotional**
- Mood: emoji picker — 😊 Happy / 😐 Neutral / 😢 Sad / 😤 Irritable / 😰 Anxious
- Energy Level: star rating 1–5
- Libido: rating 1–5 (optional)

**Section 3 — Lifestyle**
- Sleep hours: number input (0–12)
- Exercised today: toggle
- Stress level: slider 1–5
- Water intake: number (litres)

**Section 4 — Cycle-Specific**
- Cervical mucus: Dry / Sticky / Creamy / Watery / Egg-White (illustrated picker)
- Spotting: toggle
- BBT (Basal Body Temperature): number in °C (optional)
- Ovulation pain: toggle

**On save:**
- Compute cycleDay and phase at save time
- Store in SymptomLog table
- Show on calendar as a small dot indicator

**✅ Phase 7 Complete when:** Daily symptoms can be logged, retrieved by date, and shown on the calendar as indicators.

---

## Phase 8 — Insights & Analytics

**Goal:** `/insights` page shows charts and statistics derived from the full history.

### Components

**`StatsGrid.tsx`** — 6 stat tiles:
1. Average Cycle Length (days)
2. Cycle Range (e.g., "25–31 days")
3. Recent Average (last 6 cycles)
4. Cycles Tracked (total count)
5. Cycle Regularity (e.g., "Regular ✓")
6. Trend (e.g., "Stable →" / "Shortening ↓")

**`TrendChart.tsx`** — Recharts LineChart:
- X-axis: period start dates (abbreviated)
- Y-axis: cycle length in days (range 18–40)
- Line: cycle lengths over time
- Reference line: personal average (dashed rose)
- Reference band: ±1 std dev (light fill)
- Colour code dots: green = within 1σ, amber = 1–2σ, red = outside 2σ
- Tooltip: shows exact cycle length and date on hover
- Data range picker: 3 months / 6 months / 1 year / All time

**`SymptomHeatmap.tsx`** — Grid showing:
- Rows: symptoms (cramps, mood, energy, etc.)
- Columns: cycle phases (Menstrual, Follicular, Ovulatory, Luteal)
- Cell colour intensity: frequency of that symptom in that phase
- Tooltip: "Cramps logged on 4 of 6 menstrual phases"

**`HistoryTable.tsx`** — Paginated table:
| # | Period Start | Cycle Length | vs Average | Flow |
|---|-------------|--------------|------------|------|
| 1 | Aug 14 2022 | — | — | Moderate |
| 2 | Sep 11 2022 | 28 days | avg | Moderate |
| 3 | Oct 9 2022 | 28 days | avg | Light |
... with a small horizontal bar for each cycle length.

**Health Alerts Section:**
- Renders the output of `generateHealthAlerts()` as styled cards
- Info = blue, Warning = amber, Critical = red

**✅ Phase 8 Complete when:** All 4 components render live data, trend chart is interactive, and health alerts appear when thresholds are triggered.

---

## Phase 9 — Notifications & PWA

**Goal:** The app works offline and sends browser push notifications.

### PWA Setup

**`next.config.js`:**
```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});
module.exports = withPWA({ /* your next config */ });
```

**`public/manifest.json`:**
```json
{
  "name": "Luna — Cycle Tracker",
  "short_name": "Luna",
  "description": "Your body's rhythm, understood.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#fefaf7",
  "theme_color": "#c97b7b",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

### Web Push Notifications

**Generate VAPID keys:**
```bash
node -e "const wp = require('web-push'); const keys = wp.generateVAPIDKeys(); console.log(keys);"
# Put keys in .env.local
```

**`src/app/api/push/subscribe/route.ts`:**
```typescript
// POST → saves PushSubscription JSON to user.pushSubscription in database
```

**`src/hooks/useNotifications.ts`:**
```typescript
// Requests notification permission
// Subscribes to push via service worker
// Calls /api/push/subscribe to save subscription
// Returns { isSupported, isSubscribed, subscribe, unsubscribe }
```

**Notification trigger logic** (can be run via a cron job on Vercel, or checked on each page load):
- On app open: check if any notification conditions are met (from Section 6)
- If yes and push is enabled: send via `web-push.sendNotification()`

**✅ Phase 9 Complete when:** App installs as PWA, works offline for viewing data, and at least one notification fires in the browser.

---

## Phase 10 — Settings, Export & Doctor Report

**Goal:** Users can manage settings, export their data, and generate a doctor-ready PDF report.

### Settings Page (`/settings`)

**Profile section:**
- Name, Date of Birth
- Mode toggle: [Trying to Conceive] ↔ [Avoiding Pregnancy]

**Cycle settings:**
- Average Cycle Length override (manual input, shown alongside computed average)
- Luteal Phase Duration (default 14, range 10–16)
- Period Duration (default 5, range 2–10)

**Notifications:**
- Toggle notifications on/off
- Subscribe / unsubscribe from push notifications
- Choose which alerts to receive (period approaching, fertile window, etc.)

**Appearance:**
- Light / Dark mode toggle

**Data Management:**
- Export all data as JSON
- Delete all data (with confirmation dialog — irreversible)

### Export: iCal (`/api/export/ical`)
```typescript
// Generates an .ics file with events for:
//   - Period start dates (past: logged, future: predicted)
//   - Fertile window (multi-day event)
//   - Ovulation day
// User can import into Google Calendar / Apple Calendar
```

### Export: Doctor Report PDF (`/api/export/pdf`)

The PDF should contain:
1. **Header:** "Luna Cycle Tracker — Health Report" + patient name + generated date
2. **Summary stats table:** Avg cycle, range, std dev, regularity, trend
3. **Period history table:** Last 12 periods with dates and cycle lengths
4. **Symptom summary:** Top recurring symptoms per phase
5. **Cycle trend chart:** (rendered as SVG/canvas then embedded)
6. **Health alerts:** Any flagged irregularities
7. **Footer:** "This report is generated by the Luna Cycle Tracker app. It is for informational purposes only and does not constitute medical advice."

**✅ Phase 10 Complete when:** Settings persist across sessions, PDF downloads correctly, and iCal file imports into Google Calendar.

---

## UI Design System

### CSS Variables (`globals.css`)

```css
:root {
  --rose:           #c97b7b;
  --rose-light:     #f0d5d5;
  --rose-pale:      #fdf5f5;
  --sage:           #7a9e8e;
  --sage-light:     #c8ddd6;
  --sage-pale:      #f0f7f4;
  --amber:          #d4955a;
  --amber-light:    #fdf3e7;
  --lavender:       #9b8fc0;
  --lavender-light: #f0eef9;
  --blush:          #e8b4b8;
  --ink:            #2a2020;
  --ink-soft:       #5a4848;
  --parchment:      #fefaf7;
  --border:         #e8ddd8;
  --shadow:         rgba(180, 120, 110, 0.12);

  /* Phase colour tokens */
  --phase-menstrual:  var(--rose);
  --phase-follicular: var(--sage);
  --phase-ovulatory:  var(--amber);
  --phase-luteal:     var(--lavender);
  --phase-predicted:  var(--rose-light);
}

.dark {
  --rose:       #e09090;
  --ink:        #f5eded;
  --ink-soft:   #c8b0b0;
  --parchment:  #1a1212;
  --border:     #3a2828;
  --shadow:     rgba(0,0,0,0.3);
}
```

### Typography

```css
/* Display font for headings and numbers */
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

.font-display { font-family: 'Cormorant Garamond', serif; }
.font-body    { font-family: 'DM Sans', sans-serif; }
```

### Phase Badge Component

```typescript
// src/components/shared/PhaseBadge.tsx
// Props: phase: PhaseType | 'predicted'
// Renders a coloured pill badge with phase name and colour
// e.g. <PhaseBadge phase="ovulatory" /> → amber pill "Fertile / Ovulatory"
```

### Fertility Badge Component

```typescript
// src/components/shared/FertilityBadge.tsx
// Props: status: FertilityStatus, mode: 'ttc' | 'avoid'
// TTC mode:
//   peak/fertile → green "BEST DAYS TO TRY 🌸"
//   safe/safe-post → grey "Lower Fertility"
// Avoid mode:
//   peak → red "⚠ PEAK RISK — USE PROTECTION"
//   fertile → orange "⚠ HIGH RISK"
//   approaching → yellow "APPROACHING FERTILE WINDOW"
//   safe/safe-post → green "✓ LOWER RISK"
//   period → grey "Period"
```

---

## Sample Data for Testing

Use this data in `prisma/seed.ts` to create a test user with full history.

```typescript
// Test user: priya@example.com / password: test1234
// Period dates (ascending order):

const SAMPLE_PERIODS = [
  "2022-08-14", "2022-09-11", "2022-10-09", "2022-11-08", "2022-12-07",
  "2023-01-08", "2023-02-05", "2023-03-07", "2023-04-04", "2023-05-05",
  "2023-06-03", "2023-07-30", "2023-08-26", "2023-09-25", "2023-10-24",
  "2023-11-20", "2023-12-18", "2024-01-15", "2024-02-13", "2024-03-12",
  "2024-04-09", "2024-05-08", "2024-06-04", "2024-07-31", "2024-08-29",
  "2024-09-24", "2024-10-22", "2024-11-18", "2024-12-16", "2025-01-13",
  "2025-02-10", "2025-03-10", "2025-04-07", "2025-05-10", "2025-06-03",
  "2025-07-01", "2025-08-02", "2025-08-29", "2025-09-27", "2025-10-25",
  "2025-11-20", "2025-12-20", "2026-01-14", "2026-02-10", "2026-03-08"
];

// This user's cycle has been gradually shortening from ~30 days (2022) to ~27 days (2026)
// Average across all valid cycles: ~28 days
// Next predicted period: ~April 5, 2026 (±2 days)
// Ovulation for current cycle: ~March 22, 2026 (past)
```

---

## Important Rules for Cursor

1. **Never hardcode dates** — all predictions must be computed relative to `new Date()` at runtime.
2. **All computation in `cycle-engine.ts`** — API routes and components call these pure functions. No computation logic in components.
3. **Phase 1 first** — Do not start Phase 2 without completing and testing Phase 1.
4. **Mobile-first** — All layouts must work on 375px screens. Test with responsive DevTools.
5. **TypeScript strict mode** — No `any` types. All data from API must be typed.
6. **Disclaimer on all fertility info** — Every fertility-related UI element must include or link to: *"This is a wellness tool, not a medical device. Consult a healthcare provider for medical decisions."*
7. **Error boundaries** — Wrap each major section in error boundaries. If prediction computation fails, show graceful fallback.
8. **Loading states** — Every async operation needs a skeleton loader, not a blank screen.
9. **Accessibility** — All interactive elements need aria-labels. Calendar days need descriptive aria text (e.g., `aria-label="March 8 — Period Day, Day 1 of cycle"`).
10. **Privacy** — No period or symptom data should ever appear in browser URL params or be logged to the console in production.

---

*End of SPEC.md — Luna Cycle Tracker*
