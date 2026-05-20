/**
 * Breaks the session-store ↔ sync-queue require cycle.
 * Session store registers mutations at init; queue reads them here.
 */

import type { CountingSession } from '@/types/domain';

export interface SessionSyncBridge {
  getPendingSessions: () => CountingSession[];
  markSessionSynced: (id: string) => void;
  markSessionFailed: (id: string, error: string) => void;
}

let bridge: SessionSyncBridge | null = null;

export function registerSessionSyncBridge(next: SessionSyncBridge) {
  bridge = next;
}

export function getSessionSyncBridge(): SessionSyncBridge {
  if (!bridge) {
    throw new Error('[sync] Session bridge not registered — session-store failed to load');
  }
  return bridge;
}
