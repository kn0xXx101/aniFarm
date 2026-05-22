# aniFarm — Feature implementation matrix

> Tab bar is fixed: **Home · Scan · CCTV · Farms · You** (no extra tabs).

| Module | Status | Where in app |
|--------|--------|----------------|
| Authentication (login, register, OTP, forgot) | **Working** (demo + Supabase-ready) | `(auth)/*` |
| Role selection (farmer, manager, vet, staff) | **Working** | Register screen |
| Onboarding + welcome | **Working** | `welcome`, `onboarding` |
| Dashboard command center | **Working** | `(tabs)/dashboard` — hero, 3 KPIs, scan modes, chart (modules on **You** tab) |
| AI counting (live/image/video) | **Working** (mock YOLO + ByteTrack) | `(tabs)/scan`, `count-*` |
| Human exclusion from counts | **Working** | `lib/ai/counting-service`, overlay |
| Dead / sick behavior engine | **Working** (track analysis) | `lib/ai/behavior-engine` |
| CCTV monitoring | **Working** (RTSP URL feeds) | `(tabs)/cctv` |
| Security / intrusion logic | **Working** | `lib/cctv/security-engine`, `/security` |
| Animal registration | **Working** | `/animals` — chips, empty states, farm scope |
| Feed management | **Working** | `/feed` |
| Health (vaccination, mortality, weight, breeding) | **Working** | `/health` |
| Tasks | **Working** | `/tasks` |
| Sales & revenue | **Working** | `/sales` |
| Disease image scan | **Working** (MVP classifier) | `/disease-scan` |
| Vet consultation | **Working** | `/vet` |
| Analytics & reports | **Working** | `(tabs)/analytics`, `(tabs)/reports` |
| Alerts | **Working** | `(tabs)/alerts` |
| Multi-farm | **Working** | `(tabs)/farms`, farm selector |
| Offline + sync queue | **Working** | `lib/sync`, session store |
| Settings / profile | **Working** | `(tabs)/profile` |
| Supabase schema | **Ready** | `supabase/schema.sql` |
| React Query | **Wired** | `providers/query-provider` |
| TFLite YOLO on-device | **Scaffold** | `lib/ai/inference.native.ts`, `EXPO_PUBLIC_USE_TFLITE` |
| Real Supabase auth | **Configure** | Set `EXPO_PUBLIC_SUPABASE_URL` + `EXPO_PUBLIC_SUPABASE_ANON_KEY` |
| QR scanner hardware | **Tag ID + QR icon** | Animal detail screen |
| NVR WebRTC grid | **Partial** | CCTV uses stream URLs + AI ticks |

## Navigation map (no new tabs)

- **Home** → KPIs, module shortcuts, scan modes, analytics chart  
- **Scan** → AI counting entry  
- **CCTV** → cameras + live AI  
- **Farms** → farms & pens  
- **You** → profile + farm operations modules  
- **Stack routes** → `/animals`, `/tasks`, `/feed`, `/health`, `/sales`, `/disease-scan`, `/vet`, `/security`, `/operations`
