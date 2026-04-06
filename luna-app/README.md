# Luna — application

This folder is the **Next.js** app for **[LUNA](https://github.com/priyamjyotsna/LUNA)**. Project overview, features, and GitHub metadata are in the [**repository root README**](../README.md).

## Local development

```bash
cp .env.example .env.local
npm install
npx prisma db push
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply Prisma schema to `DATABASE_URL` |
| `npm run db:studio` | Prisma Studio |
| `npm run db:seed` | Seed script (if configured) |

## Mobile web (Option A) & iOS shell

**Mobile web / PWA** — Safari on iPhone: open your production URL, then **Share → Add to Home Screen**. The app uses `viewport-fit=cover`, safe-area padding for the bottom tab bar + FAB, and a web app manifest.

**Capacitor + Xcode (TestFlight / App Store)** — The native project loads your **deployed** Luna site in a WebView (same UX as the browser; no duplicate API).

1. Put your production origin in `.env.local` (not committed):

   ```bash
   CAPACITOR_SERVER_URL=https://your-app.vercel.app
   ```

   (No trailing slash. Must be `https`.)

2. First time only — generate the iOS project (requires Xcode / Apple tooling on your Mac):

   ```bash
   npm run cap:add:ios
   ```

3. After config or env changes:

   ```bash
   npx dotenv -e .env.local -- npx cap sync ios
   npm run cap:open:ios
   ```

4. In Xcode: set **Signing & Capabilities** to your Apple Developer team, pick a **bundle ID** if you change `appId` in `capacitor.config.ts`, then **Archive** for TestFlight.

`ios/` is **gitignored**; each machine runs `cap add ios` once (or you commit `ios/` if your team prefers).

**App Store** — Review [Apple guideline 4.2](https://developer.apple.com/app-store/review/guidelines/#minimum-functionality): a thin WebView may need a short note in review explaining offline/health scope. Your backend and cookies behave like Safari; ensure `NEXTAUTH_URL` matches the URL users load.
