# aniFarm — API Reference

## Configuration

Set `EXPO_PUBLIC_API_URL` in `.env.local` to point at your backend.
The app always calls the real API — there is no mock mode in production.

```env
EXPO_PUBLIC_API_URL=https://api.anifarm.app/v1
```

All requests include `Authorization: Bearer <firebase_id_token>` once the user is signed in.
Call `setApiAuthToken(token)` from `lib/api/client.ts` after Firebase sign-in.

---

## Endpoints

### `GET /health`

Health check. Called on app start.

**Response**
```json
{ "ok": true, "version": "1.0.0" }
```

---

### `POST /sessions`

Upload a completed counting session.

**Request body** (`UploadSessionPayload` in `lib/api/sessions.ts`)
```json
{
  "id": "s1001_1716000000000",
  "farmId": "f1",
  "houseId": "h1",
  "mode": "live",
  "count": 7820,
  "aliveCount": 7820,
  "deadCount": 3,
  "excludedHumans": 1,
  "avgConfidence": 0.92,
  "durationMs": 184000,
  "thumbnailUri": "https://storage.anifarm.app/thumbs/s1001.jpg",
  "notes": "Morning count",
  "createdAt": 1716000000000
}
```

**Response**
```json
{ "id": "s1001_1716000000000", "syncedAt": 1716000001000 }
```

---

### `POST /media`

Upload a thumbnail or frame image.

**Request body**
```json
{ "uri": "file:///local/path/to/image.jpg", "kind": "thumbnail" }
```

**Response**
```json
{ "url": "https://storage.anifarm.app/media/abc123.jpg", "key": "media/abc123.jpg" }
```

---

### `POST /cctv/feeds`

Register a CCTV camera feed with the backend worker.

**Request body** (`RegisterFeedPayload` in `lib/api/cctv.ts`)
```json
{
  "farmId": "f1",
  "houseId": "h1",
  "name": "House A — North Camera",
  "streamUrl": "rtsp://192.168.1.100:554/stream",
  "intervalSeconds": 60
}
```

**Response**
```json
{ "feedId": "cctv_1716000000", "status": "registered" }
```

---

### `GET /cctv/feeds/:id/latest`

Poll for the most recent count from a CCTV feed.

**Response** (`CctvCountUpdate` in `types/domain.ts`)
```json
{
  "feedId": "cctv_1716000000",
  "count": 342,
  "avgConfidence": 0.89,
  "countedAt": 1716000060000
}
```

---

### `PATCH /cctv/feeds/:id`

Update feed config (enable/disable, change interval).

**Request body**
```json
{ "enabled": false }
```

---

### `DELETE /cctv/feeds/:id`

Remove a feed from the backend worker.

---

### WebSocket `wss://<host>/cctv/ws?feedId=<id>`

Live count stream. The server pushes `CctvCountUpdate` JSON frames at the feed's configured interval.

```json
{
  "feedId": "cctv_1716000000",
  "count": 342,
  "avgConfidence": 0.89,
  "countedAt": 1716000060000,
  "boxes": []
}
```

The client (`lib/cctv/use-cctv-feeds.ts`) auto-reconnects on disconnect and falls back to polling `GET /cctv/feeds/:id/latest` if WebSocket is unavailable.

---

## Error format

All errors return:
```json
{ "message": "Human-readable error description" }
```

HTTP status codes:
- `400` — validation error
- `401` — missing or invalid token
- `403` — insufficient permissions
- `404` — resource not found
- `503` — server unavailable (triggers sync retry with backoff)

---

## Client usage

```ts
import { apiRequest, setApiAuthToken } from '@/lib/api/client';
import { uploadSession } from '@/lib/api/sessions';
import { checkApiHealth } from '@/lib/api/health';
import { processSyncQueue } from '@/lib/sync';

// After Firebase sign-in
setApiAuthToken(firebaseIdToken);

// Check connectivity
const health = await checkApiHealth();

// Force sync all pending sessions
const { synced, failed } = await processSyncQueue({ force: true });

// Direct API call
const result = await apiRequest<{ ok: boolean }>('/health');
```

---

## See also

- [PRODUCTION_SETUP.md](./PRODUCTION_SETUP.md) — step-by-step integration guide
- [ARCHITECTURE.md](./ARCHITECTURE.md) — system overview
