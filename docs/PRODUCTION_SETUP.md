# aniFarm — Production Setup Guide

Everything needed to take the app from the current working MVP to a fully functional production release. Follow the phases in order — each phase unlocks the next.

---

## Phase 1 — Authentication (Firebase)

**Why first:** Every other service (API, push notifications, RevenueCat) needs a real user identity.

### 1.1 Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Create a new project → name it `aniFarm`
3. Enable **Authentication** → Sign-in methods:
   - Email/Password ✓
   - Google ✓
   - Phone ✓

### 1.2 Install Firebase SDK

```bash
npm install @react-native-firebase/app @react-native-firebase/auth
npx expo prebuild --clean
```

Add the Firebase plugin to `app.config.ts`:

```ts
plugins: [
  // ... existing plugins
  '@react-native-firebase/app',
  '@react-native-firebase/auth',
]
```

Download `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) from the Firebase console and place them in the project root.

### 1.3 Wire auth-store.ts

Open `lib/stores/auth-store.ts` and replace the 4 TODO stubs:

```ts
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { setApiAuthToken } from '@/lib/api/client';

// signIn
signIn: async (email, password) => {
  const { user } = await auth().signInWithEmailAndPassword(email, password);
  const token = await user.getIdToken();
  setApiAuthToken(token);
  set({
    user: {
      id: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? email,
      role: 'farmer',
      tier: 'free',
      createdAt: Date.now(),
    },
    isAuthenticated: true,
  });
},

// signInWithGoogle
signInWithGoogle: async () => {
  await GoogleSignin.hasPlayServices();
  const { idToken } = await GoogleSignin.signIn();
  const credential = auth.GoogleAuthProvider.credential(idToken);
  const { user } = await auth().signInWithCredential(credential);
  const token = await user.getIdToken();
  setApiAuthToken(token);
  set({
    user: {
      id: user.uid,
      name: user.displayName ?? '',
      email: user.email ?? '',
      role: 'farmer',
      tier: 'free',
      createdAt: Date.now(),
    },
    isAuthenticated: true,
  });
},

// signInWithPhone — triggers OTP flow
signInWithPhone: async (phone) => {
  const confirmation = await auth().signInWithPhoneNumber(phone);
  // Store confirmation in a ref, then call confirmation.confirm(code) in otp.tsx
},

// register
register: async ({ name, email, phone, password }) => {
  const { user } = await auth().createUserWithEmailAndPassword(email, password);
  await user.updateProfile({ displayName: name });
  const token = await user.getIdToken();
  setApiAuthToken(token);
  set({
    user: {
      id: user.uid,
      name,
      email,
      phone,
      role: 'farmer',
      tier: 'free',
      createdAt: Date.now(),
    },
    isAuthenticated: true,
  });
},
```

### 1.4 Token refresh

Add a listener in `app/_layout.tsx` to refresh the token when it expires:

```ts
import auth from '@react-native-firebase/auth';
import { setApiAuthToken } from '@/lib/api/client';

useEffect(() => {
  const unsub = auth().onIdTokenChanged(async (user) => {
    if (user) {
      const token = await user.getIdToken();
      setApiAuthToken(token);
    } else {
      setApiAuthToken(null);
    }
  });
  return unsub;
}, []);
```

### 1.5 Google Sign-In setup

```bash
npm install @react-native-google-signin/google-signin
```

Add your Web Client ID from Firebase console to `app.config.ts`:

```ts
plugins: [
  ['@react-native-google-signin/google-signin', {
    iosUrlScheme: 'com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID',
  }]
]
```

---

## Phase 2 — Backend REST API

**Why:** Sessions, media uploads, and CCTV feeds need a real server.

### 2.1 Recommended stack

**Option A — Supabase (fastest)**
- Managed Postgres + auto-generated REST API + Auth
- Free tier covers MVP usage
- [supabase.com](https://supabase.com)

**Option B — Node.js + Express + PostgreSQL**
- Full control, deploy to Railway / Render / Fly.io

**Option C — Firebase Firestore + Cloud Functions**
- Already using Firebase Auth — natural extension

### 2.2 Required endpoints

Implement these to match `lib/api/`:

```
GET  /health
     → { ok: true, version: "1.0.0" }

POST /sessions
     Body: UploadSessionPayload (see lib/api/sessions.ts)
     → { id: string, syncedAt: number }

POST /media
     Body: { uri: string, kind: "thumbnail" | "frame" }
     → { url: string, key: string }

GET  /cctv/feeds/:id/latest
     → CctvCountUpdate (see types/domain.ts)

POST /cctv/feeds
     Body: RegisterFeedPayload (see lib/api/cctv.ts)
     → { feedId: string, status: "registered" }

DELETE /cctv/feeds/:id
PATCH  /cctv/feeds/:id

WS   /cctv/ws?feedId=<id>
     Server pushes CctvCountUpdate JSON frames
```

All routes require `Authorization: Bearer <firebase_id_token>`.

### 2.3 Supabase quick setup

```sql
-- sessions table
create table sessions (
  id text primary key,
  farm_id text not null,
  house_id text,
  user_id uuid references auth.users,
  mode text not null,
  count int not null,
  alive_count int,
  dead_count int,
  excluded_humans int,
  avg_confidence float,
  duration_ms int,
  thumbnail_uri text,
  notes text,
  created_at bigint not null,
  synced_at bigint
);

alter table sessions enable row level security;
create policy "Users own sessions"
  on sessions for all
  using (user_id = auth.uid());
```

### 2.4 Configure the app

Create `.env.local` (copy from `.env.example`):

```env
EXPO_PUBLIC_API_URL=https://your-project.supabase.co/functions/v1
EXPO_PUBLIC_API_MODE=live
```

---

## Phase 3 — EAS Dev Build (required for camera)

**Why:** Expo Go cannot run `expo-camera`, `expo-notifications`, or `react-native-firebase`.

### 3.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login   # use your Expo account (freemanjrknox)
```

### 3.2 Configure EAS

```bash
eas build:configure
```

This creates `eas.json`. Ensure it has a `development` profile:

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 3.3 Build dev client

```bash
# Android
eas build --profile development --platform android

# iOS (requires Apple Developer account)
eas build --profile development --platform ios
```

Install the resulting `.apk` / `.ipa` on your device.

### 3.4 Start dev server

```bash
npm run start   # expo start --dev-client --clear
```

Scan the QR code with the installed dev client app.

---

## Phase 4 — AI Model (TFLite)

**Why:** All counting is currently a PRNG simulation. This replaces it with real detection.

### 4.1 Get a model

**Option A — Use a pre-trained model**
- Roboflow Universe has poultry/livestock datasets
- Download YOLOv8n trained on your species
- [universe.roboflow.com](https://universe.roboflow.com)

**Option B — Train your own**
```bash
pip install ultralytics
yolo train model=yolov8n.pt data=your_dataset.yaml epochs=100 imgsz=640
```

### 4.2 Export to TFLite

```bash
yolo export model=runs/detect/train/weights/best.pt format=tflite int8=True
```

This produces `best_int8.tflite` (~4–6 MB).

### 4.3 Bundle the model

Place the model in `assets/models/anifarm_v1.tflite`.

Add to `app.config.ts`:

```ts
assetBundlePatterns: ['**/*', 'assets/models/*'],
```

### 4.4 Install inference library

```bash
npm install react-native-fast-tflite
npx expo prebuild --clean
```

### 4.5 Implement inference.native.ts

Open `lib/ai/inference.native.ts` and replace the stubs:

```ts
import { loadTensorflowModel } from 'react-native-fast-tflite';
import type { DetectionResult } from '@/lib/ai/counting-service';

let model: Awaited<ReturnType<typeof loadTensorflowModel>> | null = null;

async function getModel() {
  if (!model) {
    model = await loadTensorflowModel(
      require('../../assets/models/anifarm_v1.tflite')
    );
  }
  return model;
}

export const NATIVE_INFERENCE_AVAILABLE = true;

export async function detectImageNative(uri: string): Promise<DetectionResult> {
  const m = await getModel();
  // Preprocess image → run inference → parse boxes
  // See react-native-fast-tflite docs for tensor I/O
  const outputs = await m.run([/* preprocessed input tensor */]);
  return parseYoloOutput(outputs);
}
```

### 4.6 Enable TFLite

```env
EXPO_PUBLIC_USE_TFLITE=true
```

---

## Phase 5 — CCTV Backend Worker

**Why:** The CCTV tab is fully built in the app. It needs a server-side process to connect to cameras.

### 5.1 Python worker

```bash
pip install fastapi uvicorn ultralytics opencv-python websockets
```

```python
# worker.py
import asyncio, cv2, json, time
from ultralytics import YOLO
from fastapi import FastAPI, WebSocket
from fastapi.websockets import WebSocketDisconnect

app = FastAPI()
model = YOLO("anifarm_v1.pt")

# Store active feeds: feedId → { rtsp_url, interval_seconds }
feeds: dict = {}

@app.post("/cctv/feeds")
async def register_feed(body: dict):
    feed_id = f"feed_{int(time.time())}"
    feeds[feed_id] = body
    asyncio.create_task(run_feed(feed_id))
    return {"feedId": feed_id, "status": "registered"}

@app.websocket("/cctv/ws")
async def ws_endpoint(websocket: WebSocket, feedId: str):
    await websocket.accept()
    try:
        while True:
            update = await get_latest_count(feedId)
            await websocket.send_text(json.dumps(update))
            await asyncio.sleep(feeds.get(feedId, {}).get("intervalSeconds", 60))
    except WebSocketDisconnect:
        pass

async def run_feed(feed_id: str):
    feed = feeds[feed_id]
    cap = cv2.VideoCapture(feed["streamUrl"])
    while feed_id in feeds:
        ret, frame = cap.read()
        if not ret:
            await asyncio.sleep(5)
            continue
        results = model(frame)
        alive = sum(1 for b in results[0].boxes if int(b.cls) == 0)  # class 0 = alive
        dead  = sum(1 for b in results[0].boxes if int(b.cls) == 1)  # class 1 = dead
        # POST to /sessions and cache latest count
        await asyncio.sleep(feed.get("intervalSeconds", 60))
    cap.release()
```

Deploy to a server on the same network as your cameras, or use a VPN tunnel for remote cameras.

---

## Phase 6 — Push Notifications

**Why:** Alert delivery to farmers when mortality or overcrowding thresholds are breached.

### 6.1 Get Expo push token

Already implemented in `lib/notifications/index.ts`. The token is returned by `registerForPushNotifications()`.

Store the token on your backend when the user logs in:

```ts
// After sign-in, in auth-store.ts
const token = await registerForPushNotifications();
if (token) {
  await apiRequest('/users/push-token', { method: 'POST', body: { token } });
}
```

### 6.2 Send notifications from backend

```js
// Node.js backend
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

```bash
npm install expo-server-sdk  # on your backend
```

---

## Phase 7 — RevenueCat (Subscriptions)

### 7.1 Setup

1. Create account at [revenuecat.com](https://revenuecat.com)
2. Create an app → get API keys for iOS and Android
3. Create products in App Store Connect and Google Play Console matching `PRODUCT_IDS` in `lib/payments/revenue-cat.ts`

### 7.2 Install SDK

```bash
npm install react-native-purchases
npx expo prebuild --clean
```

### 7.3 Activate

Open `lib/payments/revenue-cat.ts` and uncomment all the `Purchases` lines.

Add to `.env.local`:

```env
EXPO_PUBLIC_REVENUECAT_KEY_IOS=appl_xxxxxxxxxxxx
EXPO_PUBLIC_REVENUECAT_KEY_ANDROID=goog_xxxxxxxxxxxx
```

Call `initRevenueCat(user.id)` after sign-in in `auth-store.ts`.

---

## Phase 8 — Sentry (Error Monitoring)

### 8.1 Setup

1. Create account at [sentry.io](https://sentry.io)
2. Create a React Native project → get DSN

### 8.2 Install

```bash
npm install @sentry/react-native
npx expo prebuild --clean
```

Add to `app.config.ts`:

```ts
plugins: [
  ['@sentry/react-native/expo', {
    organization: 'your-org',
    project: 'anifarm',
  }]
]
```

### 8.3 Activate

Open `lib/monitoring/sentry.ts` and uncomment the `Sentry` lines.

Add to `.env.local`:

```env
EXPO_PUBLIC_SENTRY_DSN=https://xxxx@oxxxx.ingest.sentry.io/xxxx
```

Call `initSentry()` in `app/_layout.tsx` after fonts load.

---

## Phase 9 — Google Maps

### 9.1 Get API key

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Enable **Maps SDK for Android** and **Maps SDK for iOS**
3. Create an API key

### 9.2 Add to app.config.ts

```ts
android: {
  package: 'ai.anifarm.app',
  jsEngine: 'hermes',
  config: {
    googleMaps: { apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY },
  },
},
ios: {
  bundleIdentifier: 'ai.anifarm.app',
  jsEngine: 'hermes',
  config: {
    googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY,
  },
},
```

---

## Phase 10 — Production Build & Store Submission

### 10.1 Build

```bash
# iOS
eas build --profile production --platform ios

# Android
eas build --profile production --platform android
```

### 10.2 Submit

```bash
# App Store (requires Apple Developer account $99/yr)
eas submit --platform ios

# Google Play (requires Google Play Developer account $25 one-time)
eas submit --platform android
```

### 10.3 Pre-submission checklist

- [ ] All `EXPO_PUBLIC_*` env vars set in EAS Secrets (`eas secret:create`)
- [ ] `app.config.ts` version bumped
- [ ] Privacy policy URL set (required by both stores)
- [ ] App icons and splash screen finalized
- [ ] Camera and notification permission strings reviewed
- [ ] `ITSAppUsesNonExemptEncryption: false` confirmed (already set)
- [ ] Test on physical iOS and Android devices
- [ ] Test offline mode (airplane mode → count → reconnect → sync)

---

## Environment variables reference

| Variable | Required | Description |
|----------|----------|-------------|
| `EXPO_PUBLIC_API_URL` | Yes (live) | Backend base URL |
| `EXPO_PUBLIC_API_MODE` | No | `mock` (default) or `live` |
| `EXPO_PUBLIC_USE_TFLITE` | No | `true` to enable native AI |
| `EXPO_PUBLIC_SENTRY_DSN` | No | Sentry error tracking |
| `EXPO_PUBLIC_REVENUECAT_KEY_IOS` | No | RevenueCat iOS key |
| `EXPO_PUBLIC_REVENUECAT_KEY_ANDROID` | No | RevenueCat Android key |
| `EXPO_PUBLIC_GOOGLE_MAPS_KEY` | No | Google Maps API key |

For EAS builds, set secrets via:

```bash
eas secret:create --scope project --name EXPO_PUBLIC_API_URL --value https://api.anifarm.app/v1
```

---

## Priority order

```
Phase 1 → Auth (Firebase)          — unlocks real users
Phase 2 → Backend API              — unlocks session sync
Phase 3 → EAS Dev Build            — unlocks camera + notifications
Phase 4 → TFLite AI model          — unlocks real counting
Phase 5 → CCTV worker              — unlocks CCTV tab
Phase 6 → Push notifications       — unlocks alert delivery
Phase 7 → RevenueCat               — unlocks subscriptions
Phase 8 → Sentry                   — unlocks error monitoring
Phase 9 → Google Maps              — unlocks farm map view
Phase 10 → Store submission        — ships to users
```

**Minimum viable production release:** Phases 1–4 + Phase 3 (dev build for testing) + Phase 10.
