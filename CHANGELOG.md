# Changelog

All notable changes to **aniFarm** are documented here.

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- **CCTV live engine** — mock/live detection with smoothed alive counts, dead flags, and staff exclusion (`lib/cctv/live-engine.ts`)
- **Unified count alerts** — `evaluateCountResult` for live, image, video, and CCTV; `deadAlertMin` setting
- **CCTV UI** — alive / dead / excluded summary on feed cards

### Fixed

- **Count screen crash (Expo Go)** — Count screens under `(tabs)` hidden routes; count UI uses plain RN `Text`/`View` (avoids NativeWind safe-area hijack); mock camera in Expo Go; guard for undefined JSX types in css-interop
- **Scan tab route** — Renamed `(tabs)/count` → `scan` to avoid router segment conflicts
- **Progress bar** — Reanimated width animation no longer misuses `withSpring` inside template string

### Changed

- **Rebrand** — App name `Poultra` → **aniFarm** (config, drawer, reports, docs, API defaults, bundle `ai.anifarm.app`)
- **App name** — Display name `Poultra AI` → `Poultra` (config, drawer, reports, docs)

### Added

- **Unified neo3d stack screens** — `farm/[id]`, `count/image`, `count/video`, `profile` with Neon Field cards and shared count components
- **Count flow components** — `CameraPreview`, `DetectionOverlay`, `HousePicker`, `CountAdjustBar`
- **AI inference layer** — `lib/ai/inference.ts` (mock + native swap), `lib/ai/config.ts`, TFLite scaffold (`inference.native.ts`)
- **Media upload API** — `lib/api/media.ts` for count evidence thumbnails
- **Push notifications** — `lib/notifications/`, registration when enabled in settings / root layout
- **Architecture documentation** — `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, root `README.md` pointer
- **API layer scaffold** — `lib/api/` with config, client, health check, session upload (mock + live modes)
- **Sync queue** — `lib/sync/queue.ts` with exponential backoff, failure marking, and connectivity gating
- **NetInfo** — `@react-native-community/netinfo` for real online/offline detection on native
- **Alert rule engine** — `lib/alerts/engine.ts` evaluates mortality and capacity thresholds from settings
- **Error boundary** — `components/ErrorBoundary.tsx` wired in root layout
- **Environment config** — `.env.example` for `EXPO_PUBLIC_API_URL` and `EXPO_PUBLIC_API_MODE`
- **Session-based analytics** — `lib/analytics/aggregate.ts` powers dashboard/insights charts from real sessions
- **API guide** — `docs/API.md` for backend contract

### Changed

- **Stack navigation** — Dark header theme for modal/detail routes; fullscreen `count/live` (no header)
- **expo-camera** — Plugin + permissions in `app.config.ts` for live counting on device
- **Session sync** — `session-store.syncPending()` delegates to sync queue + API instead of a fixed 800ms timeout
- **Auto-sync hook** — `lib/sync/index.ts` uses new queue; exposes `useSyncStatus` for UI
- **Count saves** — Live count triggers alert engine after house update

### Fixed

- Offline indicator no longer always reports “online” when NetInfo was missing from dependencies
- Removed extraneous `(tabs)/index` route declaration (expo-router layout warning)
- Broke `session-store` ↔ `sync/queue` require cycle via `session-bridge` + dynamic import
- Removed `newArchEnabled: false` from app config to align with Expo SDK 54 / dev builds

---

## [1.0.0] — 2026-05-19

### Added

- Expo SDK 54 upgrade (`ai.poultra.app`, scheme `poultra`)
- **Neon Field** UI redesign — dark theme, Outfit font, `components/neo3d/` (ambient, 3D cards, landing)
- Tab shell: Home, Scan, Farms, You
- Mock AI counting (`lib/ai/counting-service`) — image, live stream, video modes
- Zustand stores with AsyncStorage persistence
- Reports export (PDF / CSV) via `expo-print` and `expo-sharing`
- Dev client workflow (`npm start`)

### Removed

- Bilt preview integration and legacy bundle ID

### Fixed

- Metro `TerminalReporter` export error — aligned Expo 54 deps and local CLI usage

[Unreleased]: https://github.com/poultra/poultra-ai/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/poultra/poultra-ai/releases/tag/v1.0.0
