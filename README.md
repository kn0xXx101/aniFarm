# Poultra AI

> AI-powered poultry counting & farm management platform for African and global poultry operators.
>
> React Native · Expo Router · TypeScript · NativeWind · Zustand · YOLOv8 + TFLite · Firebase (production target)

This repository contains the **mobile MVP** of Poultra AI, plus the architectural specification, training pipeline, and deployment workflow needed to take it from preview to production.

---

## 1. Executive summary

Poultra AI is a mobile-first, offline-capable AI platform that lets poultry farmers count birds with their phone camera, monitor mortality and density across farms, and export auditable reports. The MVP shipped in this repo demonstrates the full end-to-end experience using a deterministic on-device counting service that mirrors the production YOLOv8 pipeline (see §10) — so every screen is exercisable in Expo Go and the web preview without bundling a 17 MB model.

Key product pillars:

| Pillar             | What it means in the app                                                  |
| ------------------ | ------------------------------------------------------------------------- |
| AI-powered         | YOLOv8 detection + ByteTrack ID tracking with confidence-weighted counts. |
| Mobile-first       | Expo + React Native, 44pt tap targets, Inter typography.                  |
| Offline-capable    | Zustand + AsyncStorage; pending sessions auto-sync on reconnect.          |
| Scalable           | Feature-folder architecture, repository pattern, swappable AI provider.   |
| Investor-ready     | Multi-tenant admin dashboard with MRR, devices, users, throughput.        |
| Enterprise-grade   | RBAC-ready user roles, audit logs, plan-based feature gating.             |

---

## 2. System architecture

```
┌─────────────────────────┐     ┌──────────────────────────┐     ┌──────────────────────┐
│  React Native (Expo)    │     │  Firebase (production)   │     │  Admin (Next.js)     │
│  ───────────────────    │ ──▶ │  Auth · Firestore · FCM  │ ──▶ │  ops · billing · ML  │
│  Zustand (persist)      │     │  Storage · Functions     │     │  multi-tenant view   │
│  React Query (server)   │ ◀── │  Security rules + indexes│ ◀── │  ssr · charts        │
│  TFLite YOLOv8n         │     │  Audit logs (BigQuery)   │     │                      │
└─────────────────────────┘     └──────────────────────────┘     └──────────────────────┘
        │  on-device                       │  cloud                       │  back-office
        ▼                                  ▼                              ▼
  Camera frames → YOLOv8 → ByteTrack → session → sync queue → Firestore → BigQuery → dashboards
```

Mobile data flow (see code):

- `lib/ai/counting-service.ts` exposes `detectFromImage`, `generateStreamFrame`, `trackUpdate` — the **same** interface a real `react-native-fast-tflite` integration would expose. Swap implementations behind a feature flag.
- `lib/stores/*` are Zustand stores with `zustand/middleware/persist` writing to AsyncStorage. Pending counting sessions live here when offline.
- `lib/sync.ts` listens for connectivity changes (via `@react-native-community/netinfo` when present) and flushes pending sessions.
- `lib/reports.ts` + `lib/file-export.ts` produce PDF (HTML → `expo-print`), CSV, and Excel-compatible exports through `expo-sharing` / web download.

---

## 3. Folder structure

```
app/                       — Expo Router screens
  _layout.tsx              — root providers, fonts, error boundary
  index.tsx                — splash router (auth gate)
  onboarding.tsx
  (auth)/                  — login, register, forgot, otp
  (tabs)/                  — dashboard, farms, count, analytics, alerts
  farm/                    — [id].tsx, new.tsx
  house/new.tsx
  count/                   — live.tsx, image.tsx, video.tsx
  reports/index.tsx
  subscription.tsx
  profile.tsx
  admin.tsx
components/                — Cross-feature UI
  ui/                      — shadcn-style primitives (button, card, input, …)
  stat-card.tsx
  line-area-chart.tsx      — SVG area chart (no chart lib)
  MapView.{tsx,web.tsx}    — platform-split map shim
hooks/                     — useColorScheme, useAsyncStorage
lib/
  ai/counting-service.ts   — YOLOv8 + ByteTrack interface (mock impl included)
  stores/                  — auth, farm, session, alert, settings (zustand+persist)
  mock-data.ts             — Seed data + buildAnalytics()
  reports.ts               — HTML + CSV report builders
  file-export.ts           — Cross-platform share/download
  sync.ts                  — Online detection + auto-sync
  constants.ts             — NAV_THEME (matches global.css HSL tokens)
  animations.ts            — Shared spring/timing presets
types/domain.ts            — Domain models (User, Farm, Session, Alert, …)
```

---

## 4. Expo setup

The app uses Expo SDK 54. Already-wired native modules:

| Module                   | Purpose                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `expo-camera`            | Live counting camera preview                                    |
| `expo-image-picker`      | Image & video selection                                         |
| `expo-file-system`       | CSV / PDF writes to documentDirectory                           |
| `expo-print`             | PDF generation from HTML                                        |
| `expo-sharing`           | Native share sheet                                              |
| `expo-video`             | Video playback in counting preview                              |
| `expo-notifications`     | Push (FCM bridge)                                               |
| `expo-secure-store`      | Encrypted tokens (Firebase auth refresh tokens)                 |
| `@shopify/flash-list`    | Virtualized lists (farms, sessions, alerts)                     |
| `react-native-svg`       | Area chart                                                      |
| `react-native-reanimated`| Camera HUD pulse, switches, transitions                         |

Run locally:

```bash
npm install
npx expo start
# press w (web), a (Android), i (iOS)
```

EAS build (production targets):

```bash
eas build:configure
eas build --profile production --platform android
eas build --profile production --platform ios
eas submit --platform android   # internal track
eas submit --platform ios       # TestFlight
```

---

## 5. Firebase setup (production)

Required Firebase services: Auth, Firestore, Storage, FCM, Functions, Analytics.

```
firebase login
firebase init firestore storage functions hosting
firebase deploy
```

Use `EXPO_PUBLIC_FIREBASE_*` env vars; wire `getApp()` inside a `lib/firebase/index.ts` module and back the stores with Firestore listeners when online (the offline cache layer is already in place — only the network adapter swaps).

---

## 6. Firestore schema

```
users/{userId}
  name · email · phone · role: farmer|admin|manager · tier · avatarUrl · createdAt

farms/{farmId}
  ownerId (→ users) · name · location · coords{lat,lng}
  capacity · flockType: broiler|layer|breeder|mixed · imageUrl · createdAt
  members: [{userId, role}]            # for multi-tenant orgs

poultry_houses/{houseId}
  farmId (→ farms) · name · capacity
  currentCount · mortality7d · lastCountedAt

counting_sessions/{sessionId}
  farmId · houseId · userId · mode: live|image|video
  count · avgConfidence · durationMs · thumbnailUri · notes
  syncStatus: synced|pending · createdAt

ai_predictions/{predId}
  sessionId (→ counting_sessions) · boxes[] · modelVersion · device · inferenceMs

analytics/{farmId}/daily/{yyyy-mm-dd}
  count · mortality · sessionCount   # rolled up via Cloud Function

alerts/{alertId}
  farmId? · kind: mortality|overcrowding|count-complete|system
  severity: info|warning|critical · title · message · read · createdAt

notifications/{notifId}
  userId · type · payload · sentAt · readAt

subscriptions/{userId}
  tier: free|basic|pro|enterprise · status: active|trialing|canceled
  renewsAt · stripeCustomerId · provider: stripe|appstore|playstore

devices/{deviceId}
  userId · platform · model · pushToken · appVersion · lastSeenAt
```

**Security rules (sketch):**

```javascript
match /farms/{farmId} {
  allow read: if isMember(farmId);
  allow write: if isOwner(farmId);
}
match /counting_sessions/{id} {
  allow create: if request.auth.uid == request.resource.data.userId;
  allow read, update: if isFarmMember(resource.data.farmId);
}
```

**Indexes:** `counting_sessions(farmId, createdAt desc)`, `alerts(farmId, read, createdAt desc)`, `analytics(farmId, date desc)`.

---

## 7. Authentication module

Implementation: `lib/stores/auth-store.ts` + `app/(auth)/*`. Production drop-in:

1. Replace mock `signIn` with `signInWithEmailAndPassword`.
2. Phone OTP → `signInWithPhoneNumber` + reCAPTCHA verifier (web) / silent verification (mobile).
3. Google → `expo-auth-session` GoogleAuthProvider.
4. Persist Firebase refresh token in `expo-secure-store`; `AsyncStorage` holds non-sensitive user profile.

Screens: `login.tsx` (tabbed email/phone), `register.tsx`, `forgot.tsx`, `otp.tsx`.

---

## 8. Farm management module

- `lib/stores/farm-store.ts` — CRUD + persistence
- `app/(tabs)/farms.tsx` — list view with capacity bars
- `app/farm/[id].tsx` — detail with houses, sessions, delete
- `app/farm/new.tsx`, `app/house/new.tsx` — modal create flows

---

## 9. AI detection module

The interface in `lib/ai/counting-service.ts` is the **contract** the production native module must satisfy:

```ts
detectFromImage(uri: string): DetectionResult
generateStreamFrame(tick: number, target?: number): DetectionResult
trackUpdate(prev: TrackedBird[], next: BoundingBox[], now: number): TrackedBird[]
```

`DetectionResult` returns normalized 0..1 boxes so the renderer is resolution-agnostic.

---

## 10. TensorFlow Lite integration (production)

Replace the mock with `react-native-fast-tflite`:

```ts
import { loadTensorflowModel } from 'react-native-fast-tflite';

const model = await loadTensorflowModel(require('@/assets/yolov8n-poultry-int8.tflite'));
const output = model.runSync([input]); // input = NHWC RGB Float32Array
const boxes = decodeYOLOv8Output(output); // NMS @ 0.45, conf @ 0.7
```

On Android, NNAPI accelerates int8 models on Snapdragon DSP + Mali GPU. On iOS, Core ML delegate routes through ANE.

### Training pipeline (Roboflow → YOLOv8 → TFLite)

```bash
# 1. Pull dataset
pip install roboflow ultralytics tensorflow
python -c "from roboflow import Roboflow; \
  rf = Roboflow(api_key='$ROBOFLOW_API_KEY'); \
  project = rf.workspace('poultra').project('poultra-counting'); \
  dataset = project.version(3).download('yolov8')"

# 2. Train YOLOv8n
yolo task=detect mode=train model=yolov8n.pt data=poultra-counting/data.yaml \
  epochs=120 imgsz=640 batch=32 device=0

# 3. Export to TFLite (int8 quantization)
yolo export model=runs/detect/train/weights/best.pt format=tflite int8=True

# 4. Bundle
cp runs/detect/train/weights/best_saved_model/best_int8.tflite \
   assets/yolov8n-poultra-int8.tflite
```

Quantization calibration uses 200 representative images per `assets/calibration/`.

---

## 11. Camera pipeline

`app/count/live.tsx` drives the live pipeline:

1. Acquire frames from `expo-camera` (or `react-native-vision-camera` for Skia frame processors in a custom dev client).
2. Each frame → `tflite.runSync(rgb_tensor)`.
3. Decoder returns ~100 candidate boxes → NMS @ 0.45 → confidence ≥ 0.7.
4. Boxes piped through `trackUpdate()` (ByteTrack) → persistent track IDs.
5. `allTrackIds.current.size` is the **deduplicated** running count.
6. HUD shows live count, fps, average confidence.

---

## 12. Bird tracking system

ByteTrack-lite implementation in `trackUpdate()`:

- IOU-based association (threshold 0.3)
- New tracks created for unmatched detections
- Track IDs persist across frames → prevents double-counting moving birds

For full ByteTrack with Kalman prediction, port the [official Python reference](https://github.com/ifzhang/ByteTrack) into a native module or `react-native-worklets` worker.

---

## 13. Dashboard & analytics

- `app/(tabs)/dashboard.tsx` — hero stats, 30d trend, quick count CTAs, farm list, alert digest.
- `app/(tabs)/analytics.tsx` — range toggle (7/30/90d), metric toggle (count/mortality), area chart.
- Chart: `components/line-area-chart.tsx` — pure SVG, no external chart lib.

---

## 14. Notifications system

- `expo-notifications` for local + push.
- Firebase Cloud Messaging tokens stored in `devices/{id}` (production).
- Cloud Function triggers FCM send on:
  - `counting_sessions` create with `count` outside acceptable range → mortality alert
  - density check (currentCount / area) above `densityThreshold` → overcrowding alert
- In-app: `useAlertStore` (persisted) + `(tabs)/alerts.tsx` + tab bar badge.

---

## 15. Offline sync system

1. Every store uses `zustand/middleware/persist` (AsyncStorage backend).
2. `addSession()` marks new rows `syncStatus: 'pending'`.
3. `lib/sync.ts` listens to NetInfo; when online flips to `true` and `autoSync` setting is on, `syncPending()` flushes the queue.
4. Conflict resolution strategy: **last-write-wins per-house** on `currentCount`, **merge** on session arrays (server is source of truth, local pending rows get a new ID after upload).

---

## 16. Reporting system

- `lib/reports.ts` builds print-ready HTML + CSV.
- `lib/file-export.ts` writes via `expo-file-system` + opens the native share sheet via `expo-sharing`.
- On web, falls back to `Blob` + `<a download>`.
- PDF: HTML → `expo-print.printToFileAsync()`.

---

## 17. Admin web dashboard

Build under `apps/admin` (Next.js 14 App Router). Pages:

```
/                — KPIs: MRR, ARPU, active users, devices online
/tenants         — list + RBAC controls
/tenants/[id]    — per-tenant farms, sessions, alerts
/billing         — Stripe-style invoicing (server-rendered)
/ml              — model version deploys + accuracy regression chart
/alerts          — central feed
```

Use `firebase-admin` server-side for tenant queries; Tailwind tokens mirror the mobile palette.

A condensed in-app version lives at `app/admin.tsx`.

---

## 18. Subscription system

`app/subscription.tsx` shows Free / Basic / Pro / Enterprise with feature lists. Mobile uses RevenueCat or `expo-iap` to wrap App Store / Play Store. Server-side webhook updates `subscriptions/{userId}`. Feature gating via `useAuthStore((s) => s.user?.tier)`.

---

## 19. Deployment guide

| Surface          | Tool                          | Command                                        |
| ---------------- | ----------------------------- | ---------------------------------------------- |
| Mobile (Android) | EAS Build                     | `eas build -p android --profile production`    |
| Mobile (iOS)     | EAS Build                     | `eas build -p ios --profile production`        |
| Firebase rules   | Firebase CLI                  | `firebase deploy --only firestore:rules`       |
| Cloud Functions  | Firebase CLI                  | `firebase deploy --only functions`             |
| Admin dashboard  | Vercel / Firebase Hosting     | `next build && firebase deploy --only hosting` |
| OTA updates      | EAS Update                    | `eas update --branch production`               |

### GitHub Actions CI (sketch)

```yaml
name: ci
on: [push]
jobs:
  lint-and-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
  build-android:
    needs: lint-and-test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: expo/expo-github-action@v8
        with: { eas-version: latest, token: ${{ secrets.EXPO_TOKEN }} }
      - run: eas build --platform android --non-interactive --profile production
```

---

## 20. Testing strategy

- **Unit**: pure functions in `lib/ai/counting-service.ts`, `lib/reports.ts` (Jest).
- **Component**: `components/ui/*` (React Native Testing Library).
- **Integration**: critical flows (sign in → count → save → sync) via Detox.
- **AI validation**: hold-out dataset (1,000 labeled photos) → MAPE ≤ 5%, F1 ≥ 0.92.
- **Performance**: live counting must sustain ≥ 12 fps on a Pixel 6a (Snapdragon 778G equivalent).

---

## 21. Scaling roadmap

1. **v1.1** — Production Firebase wire-up + RevenueCat billing.
2. **v1.2** — `react-native-fast-tflite` + real YOLOv8n int8 model.
3. **v1.3** — Multi-tenant orgs + RBAC + audit log.
4. **v1.4** — Edge inference on Raspberry Pi 5 (long-running camera feed → MQTT → app).
5. **v2.0** — Mortality vision model (sick-bird detection) + temperature/humidity sensor ingestion.
6. **v2.1** — Marketplace (vaccines, feed, vet services) with in-app commerce.

---

## Demo credentials

The MVP ships with seeded data. On the login screen tap **Sign in** with the prefilled values, or use **Continue with Google** for one-tap demo.

Pending sessions, alerts, and farms persist locally between launches via AsyncStorage.
