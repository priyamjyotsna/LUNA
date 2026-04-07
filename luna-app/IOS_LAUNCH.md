# Luna iOS — Bundle ID → Xcode → TestFlight → App Store

Use this as **one** checklist. Your Capacitor app is a **native shell** that opens your live site:  
`https://luna-lake-seven.vercel.app`

---

## 0. Where your code lives on disk

From the **git repo root** (folder that contains `luna-app/`):

```bash
cd luna-app
```

If your terminal already shows a path ending in **`luna-app`**, you are **already** there — do **not** run `cd luna-app` again.

Open Xcode anytime with:

```bash
npm run cap:open:ios
```

---

## 1. What is the Bundle ID?

The **Bundle ID** (Apple calls it an **App ID** or *bundle identifier*) is a **unique string** for your app, like a reverse domain:

- **Must match** everywhere: Capacitor config → generated Xcode project → Apple Developer → App Store Connect.

**Your project default** (see `capacitor.config.ts`):

```text
com.priyamjyotsna.luna
```

You may use a different ID (e.g. `com.yourcompany.luna`), but then you must change it **in all places** listed in section 4.

---

## 2. Apple Developer — register the App ID (once)

1. Go to [Apple Developer → Identifiers](https://developer.apple.com/account/resources/identifiers/list).
2. Click **+** → **App IDs** → **App**.
3. **Description:** e.g. `Luna Cycle Tracker`
4. **Bundle ID:** select **Explicit** and enter exactly:
   - `com.priyamjyotsna.luna`  
   (or the same string you will use in Xcode — see section 4.)
5. Enable capabilities you need (for a WebView app, defaults are often enough; add **Push** only if you add native push later).
6. **Continue** → **Register**.

---

## 3. App Store Connect — create the app record (once)

1. Open [App Store Connect](https://appstoreconnect.apple.com) → **My Apps** → **+** → **New App**.
2. **Platforms:** iOS  
3. **Name:** e.g. `Luna`  
4. **Primary language**  
5. **Bundle ID:** choose the **same** ID you registered (e.g. `com.priyamjyotsna.luna`).  
   If it does not appear, wait a minute or fix step 2.
6. **SKU:** any unique internal code, e.g. `luna-ios-1`
7. **User Access:** Full Access (or as you prefer) → **Create**.

You will return here later for **TestFlight** and **App Store** metadata (screenshots, privacy, etc.).

---

## 4. Xcode — Bundle ID + Signing (every machine)

1. Run from `luna-app`:
   ```bash
   npx dotenv -e .env.local -- npx cap sync ios
   npm run cap:open:ios
   ```
2. In the **left sidebar**, click the **blue project icon** (often `App`).
3. Under **TARGETS**, select **App**.
4. **Signing & Capabilities**
   - **Team:** your Apple Developer team
   - **Bundle Identifier:** must equal your App ID, e.g. `com.priyamjyotsna.luna`
5. If Bundle Identifier **does not** match `capacitor.config.ts`:
   - Either change **Xcode** to match `appId` in `capacitor.config.ts`, **or**
   - Change `appId` in `capacitor.config.ts`, then run:
     ```bash
     npx dotenv -e .env.local -- npx cap sync ios
     ```
     and re-check Xcode.

6. **Product → Run** ▶ on a **simulator** or connected iPhone to verify the app opens and loads your Vercel URL.

---

## 5. Production URL in the iOS build (`CAPACITOR_SERVER_URL`)

In **`luna-app/.env.local`** (not committed):

```bash
CAPACITOR_SERVER_URL=https://luna-lake-seven.vercel.app
```

No trailing slash. Then:

```bash
npx dotenv -e .env.local -- npx cap sync ios
```

Then reopen Xcode if needed. The embedded config tells the app **which** website to load.

**Vercel:** ensure `NEXTAUTH_URL` is `https://luna-lake-seven.vercel.app` so login works inside the WebView.

---

## 6. Archive → Upload → TestFlight

1. In Xcode, top bar: select **Any iOS Device (arm64)** (not “simulator”).
2. **Product → Archive** (wait for completion).
3. **Organizer** opens → **Distribute App** → **App Store Connect** → **Upload**.
4. In [App Store Connect](https://appstoreconnect.apple.com) → your app → **TestFlight**:
   - Wait until the build finishes **Processing**.
   - Complete **Export Compliance** / questionnaire if asked.
5. Add **Internal Testing** (your Apple ID), install **TestFlight** on iPhone, accept invite, install **Luna**.

---

## 7. App Store submission (after TestFlight looks good)

In App Store Connect → **App Store** tab:

- Screenshots (required sizes for current iPhones)
- Description, keywords, support URL
- **Privacy Policy URL** (recommended / often required for health-related apps)
- **App Privacy** (data collection questionnaire — answer accurately)

Add **review notes** (e.g. “App loads our web app at https://luna-lake-seven.vercel.app; test account: …” if you provide one).

**Submit for Review** when ready.

---

## Quick reference — your Bundle ID

| Place | Value (default) |
|--------|-------------------|
| `capacitor.config.ts` → `appId` | `com.priyamjyotsna.luna` |
| Xcode → Target **App** → Bundle Identifier | **same** |
| Apple Developer → Identifiers | **same** |
| App Store Connect → New App → Bundle ID | **same** |

---

## Troubleshooting

| Problem | What to do |
|---------|------------|
| `cd: no such file or directory: luna-app` | You are not inside the repo parent folder, or you are **already** in `luna-app`. Run `pwd` — if path ends with `luna-app`, just run `npm run cap:open:ios`. |
| `ios platform has not been added yet` | Run once: `npx dotenv -e .env.local -- npx cap add ios` then `cap sync ios`. |
| Signing errors | Xcode → Signing & Capabilities → pick correct **Team**; Bundle ID must exist in Developer portal. |
| Blank / white app | Confirm `CAPACITOR_SERVER_URL` and run `cap sync ios`; check device has network. |

---

## Official links

- [Capacitor iOS](https://capacitorjs.com/docs/ios)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [TestFlight](https://developer.apple.com/testflight/)
