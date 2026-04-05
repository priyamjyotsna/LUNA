# LUNA

**Your body’s rhythm, understood.**  
Luna is an open-source menstrual cycle web app: period logging, phase-aware predictions, symptom tracking, and insights—built for clarity, privacy, and optional self-hosting.

[![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io/)

**Repository:** [github.com/priyamjyotsna/LUNA](https://github.com/priyamjyotsna/LUNA)

---

## Why Luna?

- **History-first predictions** — Forecasts use *your* logged cycle lengths; defaults only fill in when data is sparse.
- **Modes that respect intent** — Separate framing for **trying to conceive (TTC)** and **avoiding pregnancy** (awareness-only; not medical advice).
- **Full picture** — Dashboard with phases and fertile-window context, calendar, symptoms (including BBT), analytics, exports, and PWA-friendly setup.
- **Stack you can trust** — Next.js (App Router), TypeScript, Prisma, NextAuth, TanStack Query, Recharts, Tailwind, shadcn-style UI.

*(If this repo helps you, consider starring it on GitHub—it improves visibility for others looking for a serious cycle-tracking codebase.)*

---

## Features

| Area | Highlights |
|------|------------|
| **Periods** | Start dates, flow, notes, anomaly flagging, cycle length trend |
| **Dashboard** | Phase wheel / timeline, prediction range, fertile-window notices, health-style alerts |
| **Calendar** | Month view tied to logs and predictions |
| **Symptoms** | Detailed logging, monthly history browser, streak nudges |
| **Insights** | Cycle stats, regularity visualization, period “rhythm” timeline, symptom heatmap & trends, BBT chart |
| **Settings & data** | Profile / cycle defaults, theme, export (e.g. PDF, iCal) |
| **Auth** | Email + Google (OAuth) via NextAuth |

---

## Repository layout

```
LUNA/
├── luna-app/          # Next.js application (install & run here)
└── LUNA/
    └── LUNA_SPEC.md   # Full product & build specification
```

---

## Quick start

Prerequisites: **Node.js 20+**, **npm** (or pnpm).

```bash
git clone https://github.com/priyamjyotsna/LUNA.git
cd LUNA/luna-app
cp .env.example .env.local
# Edit .env.local: set NEXTAUTH_SECRET, URLs, and optional OAuth / VAPID keys

npm install
npx prisma db push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For seed data or imports, see scripts in `luna-app/package.json` and `luna-app/prisma/`.

---

## Environment variables

See **`luna-app/.env.example`** for:

- `DATABASE_URL` (SQLite for local dev; use PostgreSQL in production)
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Optional: `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- Optional: Web Push (`NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_EMAIL`)

Never commit real secrets.

---

## Deployment

Luna is a standard Next.js app: deploy to **[Vercel](https://vercel.com)**, **[Railway](https://railway.app)**, **[Fly.io](https://fly.io)**, or any Node host. Use a hosted **PostgreSQL** database and set production `DATABASE_URL` and auth secrets in the host’s environment.

---

## Spec & roadmap

Product behavior, phases, and algorithms are documented in **`LUNA/LUNA_SPEC.md`**. That file is the source of truth for features and intent; the app is implemented to match it over time.

---

## Contributing

Issues and PRs are welcome. Please:

1. Open an issue for larger changes or ambiguous behavior.
2. Keep PRs focused; match existing TypeScript and UI patterns in `luna-app/`.
3. Run **`npm run lint`** and **`npm run build`** in `luna-app/` before submitting.

---

## Medical disclaimer

Luna is for **personal awareness and logging only**. It is **not** a medical device and does **not** replace professional care. Predictions are statistical and individual biology varies—always talk to a qualified clinician about health concerns.

---

## License

Add a `LICENSE` file to this repository when you are ready (e.g. MIT) so others know how they may use the code.

---

## GitHub visibility (copy-paste)

Use these in your repo **About** settings on [GitHub](https://github.com/priyamjyotsna/LUNA) to improve search and profile polish.

**Short description** (≈350 characters max):

> Luna — open-source menstrual cycle tracker: periods, phases, fertile-window context, symptoms & BBT, insights & exports. Next.js 16, TypeScript, Prisma, Recharts. Privacy-friendly, self-hostable. Not medical advice.

**Topics** (suggested tags):

`menstrual-cycle` `cycle-tracker` `period-tracker` `fertility` `womens-health` `nextjs` `typescript` `prisma` `next-auth` `recharts` `tailwindcss` `shadcn` `web-app` `pwa` `open-source` `self-hosted`

**Website** (optional): set to your production URL or docs when you have one.

---

<p align="center"><sub>Built with care for everyone who wants their cycle data to stay understandable and in their own hands.</sub></p>