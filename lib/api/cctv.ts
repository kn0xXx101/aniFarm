/**
 * CCTV API — register feeds with the backend and poll for count updates.
 *
 * The backend Python worker:
 *   1. Receives the RTSP/HLS stream URL
 *   2. Runs YOLOv8 inference at the configured interval
 *   3. POSTs count results to POST /sessions (existing endpoint)
 *   4. Exposes GET /cctv/feeds/:id/latest for polling
 *
 * WebSocket path: ws://<host>/cctv/ws?feedId=<id>
 * Polling path:   GET /cctv/feeds/:id/latest
 */

import { apiRequest } from '@/lib/api/client';
import type { CctvFeed, CctvCountUpdate } from '@/types/domain';

// ── Feed registration ─────────────────────────────────────────────────────────

export interface RegisterFeedPayload {
  farmId: string;
  houseId?: string;
  name: string;
  streamUrl: string;
  intervalSeconds: number;
}

export interface RegisterFeedResult {
  feedId: string;
  status: 'registered' | 'connecting';
}

export async function registerCctvFeed(
  payload: RegisterFeedPayload,
): Promise<RegisterFeedResult> {
  return apiRequest<RegisterFeedResult>('/cctv/feeds', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteCctvFeed(feedId: string): Promise<void> {
  await apiRequest(`/cctv/feeds/${feedId}`, { method: 'DELETE' });
}

export async function updateCctvFeed(
  feedId: string,
  patch: Partial<RegisterFeedPayload & { enabled: boolean }>,
): Promise<void> {
  await apiRequest(`/cctv/feeds/${feedId}`, { method: 'PATCH', body: patch });
}

// ── Count polling ─────────────────────────────────────────────────────────────

export async function fetchLatestCount(feedId: string): Promise<CctvCountUpdate | null> {
  try {
    return await apiRequest<CctvCountUpdate>(`/cctv/feeds/${feedId}/latest`);
  } catch {
    return null;
  }
}

// ── WebSocket live updates ────────────────────────────────────────────────────

const WS_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.poultra.ai/v1')
  .replace(/^https?/, 'wss')
  .replace(/\/$/, '');

type CountHandler = (update: CctvCountUpdate) => void;
type StatusHandler = (status: 'connected' | 'disconnected' | 'error') => void;

export interface CctvSocket {
  close: () => void;
}

/**
 * Open a WebSocket connection for a single feed.
 * Falls back gracefully if WebSocket is unavailable.
 */
export function openCctvSocket(
  feedId: string,
  onCount: CountHandler,
  onStatus?: StatusHandler,
): CctvSocket {
  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = () => {
    if (closed) return;
    try {
      ws = new WebSocket(`${WS_BASE}/cctv/ws?feedId=${feedId}`);

      ws.onopen = () => onStatus?.('connected');

      ws.onmessage = (e) => {
        try {
          const update = JSON.parse(e.data as string) as CctvCountUpdate;
          onCount(update);
        } catch {
          // ignore malformed frames
        }
      };

      ws.onerror = () => onStatus?.('error');

      ws.onclose = () => {
        onStatus?.('disconnected');
        if (!closed) {
          // Reconnect after 5s
          reconnectTimer = setTimeout(connect, 5000);
        }
      };
    } catch {
      onStatus?.('error');
      if (!closed) {
        reconnectTimer = setTimeout(connect, 10000);
      }
    }
  };

  connect();

  return {
    close: () => {
      closed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    },
  };
}

// ── Polling fallback ──────────────────────────────────────────────────────────

/**
 * Poll a feed at its configured interval when WebSocket is unavailable.
 */
export function startPolling(
  feed: CctvFeed,
  onCount: CountHandler,
): () => void {
  const intervalMs = (feed.intervalSeconds ?? 30) * 1000;
  const id = setInterval(async () => {
    const update = await fetchLatestCount(feed.id);
    if (update) onCount(update);
  }, intervalMs);
  return () => clearInterval(id);
}
