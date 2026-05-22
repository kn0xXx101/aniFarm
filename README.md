# aniFarm

AI-powered livestock counting and farm operations for modern barn teams — poultry, cattle, sheep, goats, pigs, aquaculture, and mixed herds.

**Bundle ID:** `ai.anifarm.app` · **Expo SDK 54** · **Dev client required**

---

## Features

| Area | What you get |
|------|----------------|
| **AI counting** | Live, image, and video counts with human exclusion; mock YOLO + ByteTrack today, TFLite scaffold for on-device inference |
| **Farms & pens** | Multi-farm portfolio, species-aware icons (poultry → fowl, not generic paws), houses/pen capacity |
| **CCTV** | RTSP/HLS feeds, live AI overlays, security/intrusion events (Pro) |
| **Operations** | Animals, feed, health, tasks, sales, disease scan, vet chat, security log |
| **Insights** | Analytics charts, PDF/CSV/Excel exports (tier-gated) |
| **Subscriptions** | Free / Basic / Pro / Enterprise with farm limits, count quotas, and feature gates |
| **Offline-first** | Zustand + AsyncStorage; sync queue when API mode is `live` |

### Tab bar (fixed)

**Home · Scan · CCTV · Farms · You**

Stack routes (no extra tabs): farm detail, counting flows, animals, feed, health, tasks, sales, disease scan, vet, security, operations hub, plans, profile.

---

## Stack

- **Expo SDK 54** · React Native 0.81 · React 19 · expo-router 6
- **Zustand** + AsyncStorage persistence
- **TanStack Query** + optional **Supabase**
- **NativeWind 4** · Neon Field UI (`components/neo3d/`)
- **RevenueCat** (optional IAP) · demo billing without keys
- **Lucide** icons · species-aware `LivestockTypeIcon`

---

## Quick start

### Prerequisites

- Node.js 20+
- [Expo dev client](https://docs.expo.dev/develop/development-builds/introduction/) (camera, notifications, and native modules are not fully supported in Expo Go for this app)

### Install & run

```bash
npm install
cp .env.example .env.local   # optional — defaults to mock API
npm start                    # expo start --dev-client --clear
```

Use the **local** `npm start` script, not a global legacy `expo-cli`.

### Native builds

```bash
npm run prebuild    # generate ios/ android/
npm run ios
npm run android
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Dev server + dev client |
| `npm run ios` / `npm run android` | Run on device/simulator |
| `npm run lint` | oxlint (type-aware) |
| `npm run format` | oxfmt write |

---

## Environment

Copy `.env.example` to `.env.local`. Expo loads `EXPO_PUBLIC_*` at build time.

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_MODE` | `mock` | `mock` (simulated API) or `live` (HTTP to `API_URL`) |
| `EXPO_PUBLIC_API_URL` | `https://api.anifarm.app/v1` | Backend base URL when `live` |
| `EXPO_PUBLIC_USE_TFLITE` | `false` | Enable when a TFLite model is bundled (`lib/ai/inference.native.ts`) |
| `EXPO_PUBLIC_SUPABASE_URL` | — | Optional Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | — | Optional Supabase anon key |
| `EXPO_PUBLIC_REVENUECAT_KEY_IOS` | — | Optional RevenueCat iOS key |
| `EXPO_PUBLIC_REVENUECAT_KEY_ANDROID` | — | Optional RevenueCat Android key |

Without Supabase or RevenueCat keys, the app runs fully offline-first with demo auth and local plan state.

---

## Subscription tiers (summary)

| Tier | Farms | Counting | Notable gates |
|------|-------|----------|----------------|
| **Free** | 1 | Image only · 20/mo | Core ops modules |
| **Basic** | 3 | Image + video · 500/mo | Analytics, vet chat, CSV, offline sync |
| **Pro** | 10 | + Live + CCTV | Disease scan, AI alerts, security log, PDF/XLSX |
| **Enterprise** | Unlimited | All modes | Priority support, full exports |

New accounts get a **14-day Pro trial** (stored tier remains Free). Plan logic lives in `lib/subscription/`.

---

## Project structure

```
app/
  (tabs)/          Home, Scan, CCTV, Farms, You + hidden count/analytics routes
  (auth)/          Login, register, OTP, forgot password
  farm/            Farm detail, new farm (species picker + fowl icons)
  house/           New pen / housing unit
  animals/         Registry
  feed|health|tasks|sales|vet|security|disease-scan/
  cctv/            Add feed
  operations/      Module hub
components/
  neo3d/           Neon Field shell (NeoScreen, cards, charts)
  brand/           LivestockTypeIcon (species-aware)
  shell/           TopBar, tab bar, smart back
  subscription/    Upgrade banners
lib/
  api/             HTTP client + uploads
  ai/              Counting, behavior engine, TFLite scaffold
  subscription/    Plans, gates, RevenueCat
  navigation/      smart-back route rules
  sync/            NetInfo + upload queue
  stores/          Zustand domains
  supabase/        Optional backend config
types/             domain.ts
docs/              Architecture, API, production setup, feature matrix
supabase/          schema.sql
```

---

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, data flow, modules |
| [docs/FEATURE_MATRIX.md](./docs/FEATURE_MATRIX.md) | Module status and navigation map |
| [docs/API.md](./docs/API.md) | HTTP API contract |
| [docs/PRODUCTION_SETUP.md](./docs/PRODUCTION_SETUP.md) | Firebase, Supabase, RevenueCat, TFLite, store release |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phased delivery plan |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

For production release (auth, push, IAP, on-device model, App Store / Play), start with **[docs/PRODUCTION_SETUP.md](./docs/PRODUCTION_SETUP.md)**.

---

## Navigation notes

- Back buttons use **`useSmartBack`** (`hooks/useSmartBack.ts`) with route rules in `lib/navigation/smart-back.ts` — e.g. count screens → Scan, new farm → Farms, Account modules → You when opened with `returnTo`.
- Farm registration shows a **live species preview**; poultry types use **bird/egg** icons, not paw prints.

---

## License

Proprietary — aniFarm.
