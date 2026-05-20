/**
 * CCTV API — register feeds, WebSocket live counts, polling fallback.
 *
 * Live mode: backend worker runs YOLO on RTSP/HLS and pushes counts.
 * Mock mode: client uses `lib/cctv/live-engine` (same alive/dead/human classes as manual counts).
 */

import { apiRequest } from '@/lib/api/client';
import { isMockApiMode } from '@/lib/api/config';
import { simulateCctvDetection } from '@/lib/cctv/live-engine';
import type { CctvFeed, CctvCountUpdate } from '@/types/domain';

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
  if (isMockApiMode()) {
    return { feedId: `mock_${Date.now()}`, status: 'registered' };
  }
  return apiRequest<RegisterFeedResult>('/cctv/feeds', {
    method: 'POST',
    body: payload,
  });
}

export async function deleteCctvFeed(feedId: string): Promise<void> {
  if (isMockApiMode()) return;
  await apiRequest(`/cctv/feeds/${feedId}`, { method: 'DELETE' });
}

export async function updateCctvFeed(
  feedId: string,
  patch: Partial<RegisterFeedPayload & { enabled: boolean }>,
): Promise<void> {
  if (isMockApiMode()) return;
  await apiRequest(`/cctv/feeds/${feedId}`, { method: 'PATCH', body: patch });
}

export async function fetchLatestCount(feedId: string): Promise<CctvCountUpdate | null> {
  if (isMockApiMode()) {
    return simulateCctvDetection(feedId);
  }
  try {
    return await apiRequest<CctvCountUpdate>(`/cctv/feeds/${feedId}/latest`);
  } catch {
    return null;
  }
}

const WS_BASE = (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.anifarm.app/v1')
  .replace(/^https?/, 'wss')
  .replace(/\/$/, '');

type CountHandler = (update: CctvCountUpdate) => void;
type StatusHandler = (status: 'connected' | 'disconnected' | 'error') => void;

export interface CctvSocket {
  close: () => void;
}

/**
 * Open live counting for a feed — WebSocket in live API mode, interval simulation in mock.
 */
export function openCctvSocket(
  feed: CctvFeed,
  onCount: CountHandler,
  onStatus?: StatusHandler,
): CctvSocket {
  if (isMockApiMode()) {
    const intervalMs = Math.max(5, feed.intervalSeconds ?? 30) * 1000;
    let closed = false;

    const tick = () => {
      if (closed) return;
      onStatus?.('connected');
      onCount(simulateCctvDetection(feed.id));
    };

    tick();
    const timer = setInterval(tick, intervalMs);

    return {
      close: () => {
        closed = true;
        clearInterval(timer);
      },
    };
  }

  let ws: WebSocket | null = null;
  let closed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  const feedId = feed.id;

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
          /* ignore malformed frames */
        }
      };

      ws.onerror = () => onStatus?.('error');

      ws.onclose = () => {
        onStatus?.('disconnected');
        if (!closed) {
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
