# Poultra

AI-powered poultry counting and farm operations for modern barn teams.

## Stack

- **Expo SDK 54** · React Native 0.81 · expo-router 6
- **Zustand** + AsyncStorage persistence
- **NativeWind** · Neon Field UI (`components/neo3d/`)
- **Dev client** required (`ai.poultra.app`)

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — defaults to mock API
npm start                    # local Expo CLI + dev client
```

Use `npm start`, not a global legacy `expo-cli`.

## Documentation

| Doc | Description |
|-----|-------------|
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, data flow, modules |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | Phased delivery plan |
| [CHANGELOG.md](./CHANGELOG.md) | Version history |

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `EXPO_PUBLIC_API_MODE` | `mock` | `mock` or `live` |
| `EXPO_PUBLIC_API_URL` | `https://api.poultra.ai/v1` | Backend base URL when `live` |

## Project structure

```
app/           Routes (tabs, auth, counting)
components/    UI — neo3d shell + primitives
lib/
  api/         HTTP client + session upload
  sync/        NetInfo + upload queue
  alerts/      Threshold rule engine
  analytics/   Session-based chart data
  ai/          Counting service (mock → TFLite)
  stores/      Zustand domains
types/         domain.ts
docs/          Architecture & roadmap
```

## License

Proprietary — Poultra AI.
