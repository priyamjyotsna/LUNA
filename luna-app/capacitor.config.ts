import type { CapacitorConfig } from "@capacitor/cli";

/**
 * iOS shell loads your deployed Next.js app (same as Option A, plus App Store / TestFlight).
 *
 * Set CAPACITOR_SERVER_URL to your production origin (no trailing slash), e.g.
 *   https://luna.vercel.app
 *
 * Locally: add to `.env.local` (not committed). On CI for TestFlight builds, set in Xcode scheme or
 * export before `npx cap sync`.
 */
const serverUrl = (
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  ""
).replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "com.priyamjyotsna.luna",
  appName: "Luna",
  webDir: "capacitor/www",
  ios: {
    contentInset: "automatic",
  },
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),
};

export default config;
