# API integration guide

## Modes

| `EXPO_PUBLIC_API_MODE` | Behavior |
|------------------------|----------|
| `mock` (default) | Simulated latency; ~5% random failures for queue testing |
| `live` | HTTP calls to `EXPO_PUBLIC_API_URL` |

## Endpoints (live mode)

### `GET /health`

Response: `{ "ok": true, "version": "1.0.0" }`

### `POST /sessions`

Request body matches `UploadSessionPayload` in `lib/api/sessions.ts`:

```json
{
  "id": "s1001",
  "farmId": "f1",
  "houseId": "h1",
  "mode": "live",
  "count": 7820,
  "avgConfidence": 0.92,
  "durationMs": 184000,
  "createdAt": 1716000000000
}
```

Response: `{ "id": "s1001", "syncedAt": 1716000001000 }`

## Auth (planned)

Set bearer token via `setApiAuthToken(token)` from `lib/api/client.ts` after real sign-in.

## Client usage

```ts
import { uploadSession, checkApiHealth, isMockApi } from '@/lib/api';
import { processSyncQueue } from '@/lib/sync';

await checkApiHealth();
await processSyncQueue({ force: true });
```
