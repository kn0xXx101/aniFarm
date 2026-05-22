# aniFarm — Production Setup Guide

Complete, ordered steps to take **aniFarm** from the current MVP (`ai.anifarm.app`) to production on the App Store and Google Play.

**Related docs:** [README.md](../README.md) · [API.md](./API.md) · [FEATURE_MATRIX.md](./FEATURE_MATRIX.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)

---

## Before you begin

| Requirement | Notes |
|-------------|--------|
| **Node.js** 20+ | Matches `packageManager` in `package.json` (`npm@10.9.0`) |
| **Expo account** | For EAS builds ([expo.dev](https://expo.dev)) |
| **Apple Developer** ($99/yr) | Required for iOS dev client + App Store |
| **Google Play Developer** ($25 one-time) | Required for Android release |
| **Development build** | **Not Expo Go** — camera, push, IAP, and TFLite need a dev/production binary |

### Critical behaviors (read once)

1. **Environment variables** — Expo embeds `EXPO_PUBLIC_*` at bundle time. After editing `.env.local`, **stop and restart** `npm start` (or rebuild EAS binaries).
2. **API mock vs live** — `EXPO_PUBLIC_API_MODE=mock` (default) skips HTTP in **CCTV helpers only**. The **session sync queue** (`lib/sync/queue.ts`) always calls `uploadSession()` → `apiRequest()` when you trigger sync. In mock mode, do not expect sync to succeed unless you point `API_URL` at a real server and use `live`.
3. **Auth is demo today** — `lib/stores/auth-store.ts` simulates sign-in. Production requires Phase 2 before trusting data or billing.
4. **Tab bar is fixed** — Home · Scan · CCTV · Farms · You (do not add tabs).

---

## Table of contents

1. [Current MVP baseline](#current-mvp-baseline)
2. [Recommended phase order](#recommended-phase-order)
3. [Phase 0 — Environment & local run](#phase-0--environment--local-run)
4. [Phase 1 — Development build (required)](#phase-1--development-build-required)
5. [Phase 2 — Authentication](#phase-2--authentication)
6. [Phase 3 — Backend API & session sync](#phase-3--backend-api--session-sync)
7. [Phase 4 — On-device AI (TFLite)](#phase-4--on-device-ai-tflite)
8. [Phase 5 — CCTV backend worker](#phase-5--cctv-backend-worker)
9. [Phase 6 — Push notifications](#phase-6--push-notifications)
10. [Phase 7 — RevenueCat (subscriptions)](#phase-7--revenuecat-subscriptions)
11. [Phase 8 — Sentry (error monitoring)](#phase-8--sentry-error-monitoring)
12. [Phase 9 — Google Maps (optional)](#phase-9--google-maps-optional)
13. [Phase 10 — Store build & submission](#phase-10--store-build--submission)
14. [Environment variables](#environment-variables)
15. [EAS environment / secrets](#eas-environment--secrets)
16. [Pre-submission checklist](#pre-submission-checklist)
17. [Key source files](#key-source-files)

---

## Current MVP baseline

| Area | Status | Where |
|------|--------|--------|
| Navigation | Working | `app/(tabs)/`, `app/_layout.tsx` |
| Demo auth | Working | `lib/stores/auth-store.ts` (TODO: real provider) |
| Local data | Working | Zustand + AsyncStorage stores |
| API mode | Default `mock` | `lib/api/config.ts` → `isMockApiMode()` |
| AI counts | Simulated | `lib/ai/counting-service.ts` via `lib/ai/inference.ts` |
| Subscription gates | Working | `lib/subscription/service.ts`, `lib/subscription/features.ts` |
| Pro trial on register | Working | `startRegistrationTrial(14)` — tier stays **free**, trial in subscription store |
| RevenueCat wrapper | Scaffold | `lib/payments/revenue-cat.ts` — **SDK not in `package.json` yet** |
| Supabase client | Scaffold | `lib/supabase/` + `supabase/schema.sql` |
| Session sync queue | Wired | `lib/sync/queue.ts` — use with **`API_MODE=live`** |
| CCTV UI | Working | Mock: `lib/cctv/live-engine.ts`; Live: `lib/api/cctv.ts` |
| Push (device) | Partial | `lib/notifications/index.ts` — **no-op in Expo Go** |
| TFLite | Scaffold | `lib/ai/inference.native.ts` — `NATIVE_INFERENCE_AVAILABLE = false` |

**Minimum production path:** Phases **1 → 2 → 3 → 4 → 10** (dev build, real auth, live API, real or on-device model, store release). Add **5–8** based on product promises.

---

## Recommended phase order

| Order | Phase | Unlocks |
|-------|--------|---------|
| 0 | Environment | Local run, `.env.local` |
| 1 | Development build | Camera, notifications, native modules |
| 2 | Authentication | JWT for API, stable `user.id` |
| 3 | Backend + sync | Cross-device sessions |
| 4 | TFLite (or server AI) | Real counts |
| 5 | CCTV worker | Pro CCTV beyond client mock |
| 6 | Remote push | Off-app alerts |
| 7 | RevenueCat | Paid plans in stores |
| 8 | Sentry | Production error visibility |
| 9 | Google Maps | Map views (optional) |
| 10 | Store submission | Public release |

Phases **7** and **8** can run in parallel with **3** / **4** on internal builds.

---

## Phase 0 — Environment & local run

**Goal:** Run the app locally with default mock API and confirm core flows.

### Step 0.1 — Clone and install

```bash
cd poultra
npm install
```

### Step 0.2 — Create environment file

**macOS / Linux:**

```bash
cp .env.example .env.local
```

**Windows (PowerShell):**

```powershell
Copy-Item .env.example .env.local
```

### Step 0.3 — Set development defaults

Edit `.env.local`:

```env
EXPO_PUBLIC_API_MODE=mock
EXPO_PUBLIC_API_URL=https://api.anifarm.app/v1
EXPO_PUBLIC_USE_TFLITE=false
```

Leave Supabase and RevenueCat keys empty until Phases 2 and 7.

### Step 0.4 — Start the bundler

```bash
npm start
```

This runs `expo start --dev-client --clear` (see `package.json`). Use a **development build** (Phase 1), not Expo Go, for camera and push.

### Step 0.5 — Verify mock MVP

| # | Action | Expected result |
|---|--------|-----------------|
| 1 | Sign in with any email/password | Demo auth succeeds (`auth-store`) |
| 2 | **Farms → New farm** → choose **Poultry · Broiler** | Preview shows **bird** icon (not paws) |
| 3 | **Scan → Image count** → save session | Session stored locally (`session-store`) |
| 4 | Profile → enable auto-sync (Basic+ gate in prod) | In mock mode, pending sessions stay local unless `API_MODE=live` |

**Phase 0 complete when:** App loads, auth works, farm + count flows work on a dev build.

---

## Phase 1 — Development build (required)

**Goal:** Install a native binary that includes `expo-dev-client`, `expo-camera`, and `expo-notifications`.

**Why Expo Go is insufficient:** Go does not load this project’s native stack reliably; push registration returns `null` in Go (`lib/notifications/index.ts`).

### Step 1.1 — Install EAS CLI and log in

```bash
npm install -g eas-cli
eas login
```

### Step 1.2 — Link the Expo project

From the repo root:

```bash
eas build:configure
```

Accept prompts to create `eas.json` if missing.

### Step 1.3 — Configure `eas.json`

Ensure profiles resemble:

```json
{
  "cli": {
    "version": ">= 13.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "EXPO_PUBLIC_API_MODE": "mock"
      }
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 1.4 — Build and install the dev client

```bash
eas build --profile development --platform android
eas build --profile development --platform ios
```

1. Wait for the build on [expo.dev](https://expo.dev).
2. Install the **.apk** (Android) or register device and install **.ipa** (iOS).
3. Run `npm start` on your machine.
4. Open the **aniFarm dev client** and connect to the Metro URL / QR code.

### Step 1.5 — Alternative: local native run

If you have Android Studio or Xcode configured:

```bash
npx expo prebuild
npm run android
# or
npm run ios
```

`app.config.ts` already includes the `expo-dev-client` plugin.

### Step 1.6 — Confirm app identity

| Field | Value | File |
|-------|--------|------|
| iOS bundle ID | `ai.anifarm.app` | `app.config.ts` |
| Android package | `ai.anifarm.app` | `app.config.ts` |
| URL scheme | `anifarm` | `app.config.ts` |

### Verification

- [ ] Camera permission prompt appears on **Scan → Live** or **Image** count.
- [ ] App name shows as **aniFarm**.

**Phase 1 complete when:** Daily development uses the custom dev client, not Expo Go.

---

## Phase 2 — Authentication

**Goal:** Replace demo auth with a real identity provider and wire API tokens.

**Blocked until done:** Trusted `user.id`, RevenueCat, RLS, push token ownership.

**Wire here:** `lib/stores/auth-store.ts`  
**Token helper:** `setApiAuthToken()` / `getApiAuthToken()` in `lib/api/client.ts`  
**Already called on launch:** `syncSubscriptionOnLaunch(user.id, user.tier)` in `app/_layout.tsx` when `user` exists.

### Step 2.1 — Choose a provider

| Option | Best when | Repo support |
|--------|-----------|--------------|
| **A — Supabase Auth** (recommended) | You want Postgres + `supabase/schema.sql` | `lib/supabase/client.ts`, `config.ts` |
| **B — Firebase Auth** | You already use Firebase / Cloud Functions | Install RN Firebase (not in repo yet) |

---

### Option A — Supabase Auth (recommended)

#### A.1 — Create project

1. Go to [supabase.com](https://supabase.com) → **New project**.
2. Save **Project URL** and **anon public** key.

#### A.2 — Apply database schema

1. Open **SQL Editor** in Supabase.
2. Paste and run the full script: `supabase/schema.sql`.
3. Confirm tables exist: `profiles`, `farms`, `animals`, `ai_counts`, `cameras`, etc.

#### A.3 — Auto-create profile on sign-up

Add a trigger so `auth.users` rows get a `profiles` row (adjust roles as needed):

```sql
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, name, role, tier)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'farmer'),
    'free'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### A.4 — Enable auth providers

In Supabase **Authentication → Providers**:

- [ ] Email (required for email/password)
- [ ] Phone (if using `app/(auth)/otp.tsx`)
- [ ] Google (optional)

Configure redirect URLs for mobile if using OAuth.

#### A.5 — Set app environment variables

```env
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

Restart `npm start` after saving.

#### A.6 — Implement `auth-store` methods

For each method below, replace the demo `setTimeout` stub.

| Method | Implementation notes |
|--------|----------------------|
| `signIn` | `signInWithPassword` → `setApiAuthToken(session.access_token)` → load `profiles` row → `set({ user, isAuthenticated: true })` |
| `register` | `signUp` → ensure profile exists → **`tier: 'free'`** → `startRegistrationTrial(14)` → do **not** set `tier: 'pro'` |
| `signInWithGoogle` | OAuth / ID token flow per Supabase docs → map to `User` |
| `signInWithPhone` | `signInWithOtp` / verify in `otp.tsx` with `verifyOtp` — store pending confirmation between screens |
| `signOut` | `await sb.auth.signOut()` → `setApiAuthToken(null)` → `set({ user: null, isAuthenticated: false })` |

Example **email sign-in** core:

```ts
import { getSupabase } from '@/lib/supabase/client';
import { setApiAuthToken } from '@/lib/api/client';

const sb = getSupabase();
if (!sb) throw new Error('Supabase not configured');

const { data, error } = await sb.auth.signInWithPassword({ email, password });
if (error) throw error;
const session = data.session;
if (!session) throw new Error('No session');

setApiAuthToken(session.access_token);

const { data: profile } = await sb
  .from('profiles')
  .select('name, role, tier, phone')
  .eq('id', session.user.id)
  .single();

set({
  user: {
    id: session.user.id,
    name: profile?.name ?? email,
    email: session.user.email ?? email,
    phone: profile?.phone,
    role: (profile?.role as User['role']) ?? 'farmer',
    tier: 'free',
    createdAt: Date.now(),
  },
  isAuthenticated: true,
});
```

Map fields to `User` in `types/domain.ts`.

#### A.7 — Keep session token fresh

In `app/_layout.tsx` (alongside existing subscription effect):

```ts
import { getSupabase } from '@/lib/supabase/client';
import { setApiAuthToken } from '@/lib/api/client';

useEffect(() => {
  const sb = getSupabase();
  if (!sb) return;
  const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
    setApiAuthToken(session?.access_token ?? null);
  });
  return () => subscription.unsubscribe();
}, []);
```

---

### Option B — Firebase Auth

#### B.1 — Firebase console

1. Create project **aniFarm**.
2. Enable **Email/Password**, **Google**, **Phone** as needed.
3. Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) into the **project root**.

#### B.2 — Install native SDKs

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
npm install @react-native-google-signin/google-signin
npx expo prebuild --clean
```

#### B.3 — Configure `app.config.ts` plugins

```ts
plugins: [
  // ...existing plugins
  '@react-native-firebase/app',
  '@react-native-firebase/auth',
  [
    '@react-native-google-signin/google-signin',
    {
      iosUrlScheme: 'com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID',
    },
  ],
]
```

#### B.4 — Wire `auth-store.ts`

- Email: `auth().signInWithEmailAndPassword` / `createUserWithEmailAndPassword`
- Google: `GoogleSignin` + `GoogleAuthProvider.credential`
- Phone: `signInWithPhoneNumber` → confirm code in `app/(auth)/otp.tsx`
- Each success: `const token = await user.getIdToken(); setApiAuthToken(token);`
- **Register:** `tier: 'free'` + `startRegistrationTrial(14)`
- **Remove** demo behavior that sets `tier: 'pro'` on Google sign-in (`auth-store.ts` line ~59 today)

#### B.5 — Token refresh in `app/_layout.tsx`

```ts
import auth from '@react-native-firebase/auth';
import { setApiAuthToken } from '@/lib/api/client';

useEffect(() => {
  const unsub = auth().onIdTokenChanged(async (user) => {
    setApiAuthToken(user ? await user.getIdToken() : null);
  });
  return unsub;
}, []);
```

Rebuild the dev client after `prebuild`.

---

### Phase 2 verification

| # | Check |
|---|--------|
| 1 | New user row appears in Supabase `auth.users` + `profiles` (or Firebase console) |
| 2 | `getApiAuthToken()` returns a non-null JWT after sign-in |
| 3 | Sign-out clears token and returns to login |
| 4 | Register grants **14-day trial** but `user.tier` remains **`free`** |
| 5 | `syncSubscriptionOnLaunch` still runs (watch logs / Plans screen) |

**Phase 2 complete when:** No production build relies on demo credentials.

---

## Phase 3 — Backend API & session sync

**Goal:** Persist counting sessions (and optional media/CCTV) to your server.

### Step 3.1 — Switch to live API mode

```env
EXPO_PUBLIC_API_MODE=live
EXPO_PUBLIC_API_URL=https://api.anifarm.app/v1
```

Use your staging URL until production is ready. **Restart the bundler.**

### Step 3.2 — Implement backend routes

Contract: **[docs/API.md](./API.md)**. Minimum routes:

| Method | Path | Purpose |
|--------|------|---------|
| `GET` | `/health` | `{ "ok": true, "version": "1.0.0" }` |
| `POST` | `/sessions` | Upsert counting session |
| `POST` | `/media` | Thumbnail upload (optional) |
| `POST` | `/cctv/feeds` | Register camera worker |
| `GET` | `/cctv/feeds/:id/latest` | Poll latest counts |
| `DELETE` | `/cctv/feeds/:id` | Remove feed |
| `PATCH` | `/cctv/feeds/:id` | Update feed |
| `WS` | `/cctv/ws?feedId=` | Push `CctvCountUpdate` (optional) |
| `POST` | `/users/push-token` | Store Expo push token (Phase 6) |

**Authorization:** `Authorization: Bearer <JWT>` on every route (Supabase access token or Firebase ID token).

### Step 3.3 — Match the client session payload

The sync queue sends **`UploadSessionPayload`** from `lib/api/sessions.ts` (via `sessionToPayload` in `lib/sync/queue.ts`):

| Field | Type | Notes |
|-------|------|--------|
| `id` | string | Client-generated, e.g. `s1_1716000000000` |
| `farmId` | string | |
| `houseId` | string? | |
| `mode` | `image` \| `video` \| `live` \| `cctv` | |
| `count` | number | Alive count (primary) |
| `avgConfidence` | number | |
| `durationMs` | number | |
| `thumbnailUri` | string? | |
| `notes` | string? | |
| `createdAt` | number | Unix ms |

`CountingSession` also stores `aliveCount`, `deadCount`, `excludedHumans` locally; extend `UploadSessionPayload` + backend if you need them server-side (API.md shows optional extended JSON).

### Step 3.4 — Hosting options

| Option | Steps |
|--------|--------|
| **Custom REST API** | Deploy Node/Go service; set `EXPO_PUBLIC_API_URL` to `https://your-api/v1` |
| **Supabase Edge Functions** | Implement handlers under `https://<ref>.supabase.co/functions/v1`; set `API_URL` to that base |
| **Supabase tables only** | Use PostgREST for CRUD; add Edge Functions for uploads/WebSockets |

### Step 3.5 — How sync works in the app

| Component | Behavior |
|-----------|----------|
| `useSessionStore.addSession` | Creates session with `syncStatus: 'pending'` |
| `processSyncQueue` | `lib/sync/queue.ts` — uploads pending sessions when **online** |
| `useAutoSync` | `app/(tabs)/dashboard.tsx` — runs queue when `autoSync` setting on **and** `canUseFeature('offline_sync').ok` (Basic+) |
| Manual retry | Profile / session UI can call `syncPending({ force: true })` |

**Important:** `processSyncQueue` does **not** check `isMockApiMode()`. With `API_MODE=mock`, CCTV skips HTTP, but **session sync still hits `API_URL` if invoked**. Use `live` only when the backend is ready.

### Step 3.6 — Test session sync

| # | Step | Expected |
|---|------|----------|
| 1 | Set `API_MODE=live`, valid `API_URL`, signed-in user with token | |
| 2 | Complete an image count | Session `pending` in store |
| 3 | Enable auto-sync (Basic+ or trial Pro) + network on | `syncStatus` → `synced` |
| 4 | Airplane mode → count → online | Queue drains after reconnect |

### Phase 3 verification

- [ ] `GET /health` returns 200 from the device network
- [ ] `POST /sessions` returns `{ id, syncedAt }`
- [ ] Invalid token returns 401
- [ ] Idempotent upsert on duplicate `id`

**Phase 3 complete when:** Sessions survive app restart and appear in your database.

---

## Phase 4 — On-device AI (TFLite)

**Goal:** Replace mock detection with a bundled model.

**Today:** `lib/ai/inference.ts` uses mock unless **both**:

1. `EXPO_PUBLIC_USE_TFLITE=true` (or `1`) — see `lib/ai/config.ts` → `USE_NATIVE_INFERENCE`
2. `NATIVE_INFERENCE_AVAILABLE === true` in `lib/ai/inference.native.ts`

### Step 4.1 — Train or download a model

- Classes must map to app logic: **`livestock_alive`**, **`livestock_dead`**, **`human`** (humans excluded from count — `summarizeDetections` in `lib/livestock.ts`).
- Train example: `yolo train model=yolov8n.pt data=your_dataset.yaml epochs=100 imgsz=640`

### Step 4.2 — Export to TFLite

```bash
yolo export model=runs/detect/train/weights/best.pt format=tflite int8=True
```

### Step 4.3 — Add model to the repo

```text
assets/models/anifarm_v1.tflite
```

`app.config.ts` already includes `assetBundlePatterns: ['**/*']`.

### Step 4.4 — Install native runtime

```bash
npm install react-native-fast-tflite
npx expo prebuild --clean
eas build --profile development --platform android
```

### Step 4.5 — Implement `lib/ai/inference.native.ts`

| Export | Responsibility |
|--------|----------------|
| `NATIVE_INFERENCE_AVAILABLE` | Set `true` when model loads |
| `detectImageNative(uri)` | Image count path |
| `detectFrameNative(tick, target)` | Live count loop |

`lib/ai/inference.ts` will call these automatically when the flag is true.

### Step 4.6 — Enable in environment

```env
EXPO_PUBLIC_USE_TFLITE=true
```

Rebuild the dev client (native module change).

### Step 4.7 — Validate counting

| # | Check |
|---|--------|
| 1 | Image count boxes align with animals in test photos |
| 2 | Live count maintains acceptable FPS |
| 3 | Humans in frame do not increase displayed alive count |
| 4 | Monthly count quota still enforced (`canStartCount`) |

**Phase 4 complete when:** `NATIVE_INFERENCE_AVAILABLE` is true on device and counts are trustworthy.

---

## Phase 5 — CCTV backend worker

**Goal:** Server-side inference for RTSP/HLS streams (Pro feature).

### Client behavior (accurate)

| `API_MODE` | Register feed | Live updates |
|------------|---------------|--------------|
| `mock` | Returns `mock_<timestamp>` locally | `openCctvSocket` uses `simulateCctvDetection` (`lib/api/cctv.ts`) |
| `live` | `POST /cctv/feeds` | WebSocket `wss://<host>/cctv/ws?feedId=` derived from `EXPO_PUBLIC_API_URL` |

**Subscription gate:** `canUseFeature('cctv')` — Pro tier (`lib/subscription/features.ts`). Hook `lib/cctv/use-cctv-feeds.ts` does nothing when gate fails.

### Step 5.1 — Deploy a worker

Worker responsibilities:

1. Accept `POST /cctv/feeds` with `{ farmId, name, streamUrl, intervalSeconds }`.
2. Read frames (OpenCV / FFmpeg / GStreamer).
3. Run the same class taxonomy as mobile counts.
4. Expose `GET /cctv/feeds/:id/latest` and/or push on WebSocket.
5. Optionally POST counting sessions to `/sessions`.

### Step 5.2 — Security

- Do not embed RTSP credentials in the mobile app.
- Authenticate worker ↔ API with service credentials.
- Validate `farmId` belongs to the JWT user.

### Phase 5 verification

- [ ] `POST /cctv/feeds` returns `{ feedId, status: "registered" }`
- [ ] App shows non-mock counts with `API_MODE=live`
- [ ] WebSocket reconnects after drop (client retries every 5s)

---

## Phase 6 — Push notifications

**Goal:** Deliver alerts when the app is backgrounded.

### Step 6.1 — Client behavior (current code)

| Condition | `registerForPushNotifications()` |
|-----------|----------------------------------|
| Expo Go | Returns `null` immediately |
| Web | Returns `null` |
| Dev/production build + permission granted | Returns Expo push token string |

Registration runs from `app/_layout.tsx` when `pushEnabled` is true in settings (`useSettingsStore`).

### Step 6.2 — Configure Expo push credentials

1. In [expo.dev](https://expo.dev) → your project → **Credentials**.
2. Set up **FCM** (Android) and **APNs** (iOS) via EAS.
3. Rebuild production/preview binaries after credential changes.

### Step 6.3 — Persist token on your backend

After successful auth (e.g. in `auth-store` or post-login effect):

```ts
import { Platform } from 'react-native';
import { registerForPushNotifications } from '@/lib/notifications';
import { apiRequest } from '@/lib/api/client';

const token = await registerForPushNotifications();
if (token) {
  await apiRequest('/users/push-token', {
    method: 'POST',
    body: { token, platform: Platform.OS },
  });
}
```

Implement `POST /users/push-token` on your API.

### Step 6.4 — Send from server

```bash
npm install expo-server-sdk
```

```js
const { Expo } = require('expo-server-sdk');
const expo = new Expo();

async function sendAlert(pushToken, title, body) {
  if (!Expo.isExpoPushToken(pushToken)) return;
  await expo.sendPushNotificationsAsync([{
    to: pushToken,
    title,
    body,
    sound: 'default',
    data: { type: 'alert' },
  }]);
}
```

Mirror rules from `lib/alerts/evaluate-count.ts` server-side for parity with local notifications.

### Step 6.5 — Product tier alignment

| Feature | Minimum tier |
|---------|----------------|
| `ai_alerts` (bell, alert center gating) | **Pro** |

Confirm marketing copy matches `FEATURE_MIN_TIER` in `lib/subscription/features.ts`.

### Phase 6 verification

- [ ] Physical device receives Expo push from your backend
- [ ] Token saved per user in database
- [ ] iOS/Android credentials valid in EAS

---

## Phase 7 — RevenueCat (subscriptions)

**Goal:** App Store / Play billing for **Basic** and **Pro**.

### Already in the repo

| Piece | Location |
|-------|----------|
| Plans & limits | `lib/subscription/plans.ts` |
| Feature gates | `lib/subscription/features.ts`, `enforceSubscriptionGate()` |
| Plans UI | `app/(tabs)/subscription.tsx` |
| IAP adapter | `lib/payments/revenue-cat.ts` (dynamic import) |
| Launch sync | `syncSubscriptionOnLaunch()` in `app/_layout.tsx` |
| Demo purchase | Without keys, `purchasePlan()` updates local tier only |

**Not installed by default:** `react-native-purchases` must be added (Step 7.2).

### Step 7.1 — Store + RevenueCat dashboard

1. [revenuecat.com](https://www.revenuecat.com) → create project **aniFarm**.
2. Link **App Store Connect** and **Google Play** apps (bundle `ai.anifarm.app`).
3. Create products matching `PRODUCT_IDS` in `lib/subscription/plans.ts`:

| Product ID | Plan |
|------------|------|
| `anifarm_basic_monthly` | Basic |
| `anifarm_pro_monthly` | Pro |
| `anifarm_pro_annual` | Pro (annual) |

4. Create **Entitlements** in RevenueCat and map to keys in `ENTITLEMENT_MAP`:

| RevenueCat entitlement id | App tier |
|---------------------------|----------|
| `basic_monthly` | `basic` |
| `pro_monthly` | `pro` |
| `pro_annual` | `pro` |
| `enterprise` | `enterprise` |

### Step 7.2 — Install SDK and rebuild

```bash
npm install react-native-purchases
npx expo prebuild --clean
eas build --profile development --platform android
```

No manual “uncomment” — `revenue-cat.ts` loads the module when present.

### Step 7.3 — Environment keys

```env
EXPO_PUBLIC_REVENUECAT_KEY_IOS=appl_xxxxxxxx
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=goog_xxxxxxxx
```

Restart bundler. For EAS production builds, set via [EAS environment](#eas-environment--secrets).

### Step 7.4 — Sandbox testing

| # | Action | Expected |
|---|--------|----------|
| 1 | Sign in on dev build with real `user.id` | `initRevenueCat(userId)` runs inside `syncSubscriptionOnLaunch` |
| 2 | Purchase Basic (sandbox) | Video count + analytics unlock |
| 3 | Purchase Pro | Live, CCTV, disease scan unlock |
| 4 | Restore purchases | `user.tier` updates from entitlements |

### Plan limits reference (enforced in app)

| Tier | Farms | Modes | Monthly counts | Notable features |
|------|-------|-------|----------------|------------------|
| Free | 1 | Image | 20 | Core ops modules |
| Basic | 3 | Image, video | 500 | Analytics, vet, CSV, offline sync |
| Pro | Unlimited | + Live, CCTV | Unlimited | Disease scan, AI alerts, security, PDF/XLSX |
| Enterprise | Unlimited | All | Unlimited | Contact sales (`purchasePlan('enterprise')` opens mailto) |

**Trial:** `startRegistrationTrial(14)` on register — effective tier acts as Pro via `getEffectiveTier()` while `user.tier` stays `free`.

### Phase 7 verification

- [ ] Sandbox Basic/Pro purchases change gating in the app
- [ ] Restore works after reinstall
- [ ] App Store subscription metadata and privacy labels submitted

---

## Phase 8 — Sentry (error monitoring)

**Goal:** Capture crashes and errors in production builds.

**Scaffold:** `lib/monitoring/sentry.ts` — `initSentry()` no-ops in `__DEV__` even with DSN set.

### Step 8.1 — Create Sentry project

1. [sentry.io](https://sentry.io) → React Native → project **anifarm**.
2. Copy DSN.

### Step 8.2 — Install and configure

```bash
npm install @sentry/react-native
npx expo prebuild --clean
```

`app.config.ts`:

```ts
plugins: [
  [
    '@sentry/react-native/expo',
    {
      organization: 'your-org',
      project: 'anifarm',
    },
  ],
],
```

### Step 8.3 — Activate code

1. Uncomment `Sentry.init`, `captureException`, `captureMessage`, `setUser` in `lib/monitoring/sentry.ts`.
2. Call `initSentry()` from `app/_layout.tsx` after fonts load (alongside `initPostHog`).
3. Optionally call `captureException` from `components/ErrorBoundary.tsx`.

```env
EXPO_PUBLIC_SENTRY_DSN=https://xxxx@oxxxx.ingest.sentry.io/xxxx
```

### Step 8.4 — Verify

Trigger a test error in a **preview/production** build (not dev). Confirm event in Sentry dashboard.

---

## Phase 9 — Google Maps (optional)

**Goal:** Enable `react-native-maps` where geographic views are used.

### Steps

1. [Google Cloud Console](https://console.cloud.google.com) → enable **Maps SDK for Android** and **Maps SDK for iOS**.
2. Create API key; restrict by bundle ID `ai.anifarm.app` and Android SHA-1.
3. Add to `.env.local`:

```env
EXPO_PUBLIC_GOOGLE_MAPS_KEY=AIzaSy...
```

4. Update `app.config.ts`:

```ts
android: {
  package: 'ai.anifarm.app',
  config: {
    googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY },
  },
},
ios: {
  bundleIdentifier: 'ai.anifarm.app',
  config: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
  },
},
```

5. Rebuild native app.

---

## Phase 10 — Store build & submission

### Step 10.1 — Set production environment on EAS

Configure all `EXPO_PUBLIC_*` variables for the **production** profile (see [EAS environment](#eas-environment--secrets)). Set at minimum:

- `EXPO_PUBLIC_API_MODE=live`
- `EXPO_PUBLIC_API_URL`
- Auth-related vars (Supabase or ensure tokens come from Firebase)
- RevenueCat keys (if shipping paid plans)
- `EXPO_PUBLIC_USE_TFLITE=true` (if shipping on-device AI)

### Step 10.2 — Production builds

```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Step 10.3 — Submit to stores

```bash
eas submit --platform ios
eas submit --platform android
```

### Step 10.4 — Store listing requirements

| Item | Notes |
|------|--------|
| Privacy policy URL | Required by Apple and Google |
| Screenshots | Home, Scan, Farms (species icons), Plans, CCTV |
| Subscription disclosures | Match RevenueCat products |
| Permissions | Camera string in `app.config.ts` (livestock counting) |
| Encryption | `ITSAppUsesNonExemptEncryption: false` already in `app.config.ts` |

---

## Environment variables

Copy from [.env.example](../.env.example). All are `EXPO_PUBLIC_*` (embedded at build time).

| Variable | Required when | Default | Description |
|----------|---------------|---------|-------------|
| `EXPO_PUBLIC_API_MODE` | — | `mock` | `mock` or `live` |
| `EXPO_PUBLIC_API_URL` | `live` | `https://api.anifarm.app/v1` | REST base; also used to derive CCTV WebSocket host |
| `EXPO_PUBLIC_USE_TFLITE` | On-device AI | `false` | `true` or `1` enables native path in `lib/ai/config.ts` |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase auth | — | Project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase auth | — | Anon key (public) |
| `EXPO_PUBLIC_REVENUECAT_KEY_IOS` | iOS IAP | — | RevenueCat Apple API key |
| `EXPO_PUBLIC_REVENUECAT_KEY_ANDROID` | Android IAP | — | RevenueCat Google API key |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry | — | Error monitoring DSN |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | Maps | — | Google Maps SDK key |

**Not in `.env.example` but documented above:** add `EXPO_PUBLIC_SENTRY_DSN` and `EXPO_PUBLIC_GOOGLE_MAPS_KEY` to `.env.local` when needed.

---

## EAS environment / secrets

Do not commit `.env.local`.

**Per-profile variables (recommended):**

```bash
eas env:create --name EXPO_PUBLIC_API_MODE --value live --environment production
eas env:create --name EXPO_PUBLIC_API_URL --value https://api.anifarm.app/v1 --environment production
```

**Legacy project secrets (still supported):**

```bash
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_URL --value https://xxxx.supabase.co
eas secret:create --scope project --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value eyJ...
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_KEY_IOS --value appl_xxx
eas secret:create --scope project --name EXPO_PUBLIC_REVENUECAT_KEY_ANDROID --value goog_xxx
eas secret:create --scope project --name EXPO_PUBLIC_USE_TFLITE --value true
eas secret:create --scope project --name EXPO_PUBLIC_SENTRY_DSN --value https://...
```

List: `eas env:list` or `eas secret:list`

Rebuild after changing environment variables.

---

## Pre-submission checklist

### Build & configuration

- [ ] All production `EXPO_PUBLIC_*` values set in EAS for `production` profile
- [ ] `version` in `app.config.ts` incremented
- [ ] Tested on **physical** iOS and Android dev builds
- [ ] `EXPO_PUBLIC_API_MODE=live` tested against staging API

### Authentication & data

- [ ] Demo auth disabled or limited to internal builds
- [ ] `setApiAuthToken` on sign-in; cleared on sign-out
- [ ] Session sync succeeds on Basic+ (or Pro trial) with live API
- [ ] No accidental `tier: 'pro'` on OAuth in production

### Product & UX

- [ ] Tiers match [FEATURE_MATRIX.md](./FEATURE_MATRIX.md) and store products
- [ ] 14-day trial copy matches Plans screen behavior
- [ ] Poultry farms show fowl icons; modal back navigation returns to Farms / You as intended

### AI & CCTV

- [ ] TFLite enabled **or** marketing states cloud inference only
- [ ] CCTV worker live if Pro CCTV is advertised

### Compliance & monetization

- [ ] Privacy policy and terms URLs live
- [ ] Camera and notification permission strings accurate
- [ ] Subscription terms and restore button (App Store requirement)
- [ ] RevenueCat entitlements match `ENTITLEMENT_MAP`

### Monitoring

- [ ] Sentry event from staging/production build
- [ ] Push token stored; test notification received

---

## Key source files

| Concern | Path |
|---------|------|
| Auth (replace stubs) | `lib/stores/auth-store.ts` |
| API client & token | `lib/api/client.ts`, `lib/api/config.ts` |
| Session upload | `lib/api/sessions.ts`, `lib/sync/queue.ts` |
| CCTV API | `lib/api/cctv.ts`, `lib/cctv/use-cctv-feeds.ts` |
| Supabase | `lib/supabase/config.ts`, `lib/supabase/client.ts`, `supabase/schema.sql` |
| Subscriptions | `lib/subscription/service.ts`, `lib/subscription/plans.ts` |
| RevenueCat | `lib/payments/revenue-cat.ts` |
| AI entry | `lib/ai/inference.ts`, `lib/ai/inference.native.ts`, `lib/ai/config.ts` |
| Notifications | `lib/notifications/index.ts` |
| Sentry | `lib/monitoring/sentry.ts` |
| Root layout | `app/_layout.tsx` |
| Expo config | `app.config.ts` |

---

*Last updated: aniFarm MVP — Expo SDK 54 · React Native 0.81 · bundle `ai.anifarm.app`.*
