import type { CapacitorConfig } from "@capacitor/cli";

/**
 * iOS/Android shells load your deployed Next.js app in the WebView.
 *
 * **Vercel env vars do not apply here.** `cap sync` runs on your Mac (or CI) and evaluates this file;
 * it writes `server.url` into `ios/.../capacitor.config.json`. Only those variables are visible
 * during `cap sync` (e.g. `dotenv -e .env.local` or CI secrets)—not variables you set in Vercel.
 *
 * Override with `CAPACITOR_SERVER_URL` or `NEXT_PUBLIC_APP_URL` (no trailing slash), e.g. staging.
 */
const PRODUCTION_APP_ORIGIN = "https://luna-lake-seven.vercel.app";

const serverUrl = (
  process.env.CAPACITOR_SERVER_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  PRODUCTION_APP_ORIGIN
).replace(/\/$/, "");

const config: CapacitorConfig = {
  appId: "com.priyamjyotsna.luna",
  appName: "Luna",
  webDir: "capacitor/www",
  ios: {
    contentInset: "automatic",
  },
  server: {
    url: serverUrl,
    cleartext: false,
  },
};

export default config;
