/**
 * Session upload queue — retries with exponential backoff when online.
 */

import { uploadSession } from '@/lib/api/sessions';
import { getIsOnline } from '@/lib/sync/connectivity';
import { getSessionSyncBridge } from '@/lib/sync/session-bridge';
import type { CountingSession } from '@/types/domain';

const MAX_ATTEMPTS = 4;
const BASE_DELAY_MS = 800;

export interface SyncQueueResult {
  synced: number;
  failed: number;
  skippedOffline: boolean;
}

export interface SyncQueueState {
  running: boolean;
  lastRunAt: number | null;
  lastError: string | null;
  lastSynced: number;
  lastFailed: number;
}

let queueState: SyncQueueState = {
  running: false,
  lastRunAt: null,
  lastError: null,
  lastSynced: 0,
  lastFailed: 0,
};

const stateListeners = new Set<(s: SyncQueueState) => void>();

function emitState() {
  stateListeners.forEach((l) => l({ ...queueState }));
}

export function getSyncQueueState(): SyncQueueState {
  return { ...queueState };
}

export function subscribeSyncQueue(listener: (s: SyncQueueState) => void): () => void {
  stateListeners.add(listener);
  listener({ ...queueState });
  return () => stateListeners.delete(listener);
}

function sessionToPayload(session: CountingSession) {
  return {
    id: session.id,
    farmId: session.farmId,
    houseId: session.houseId,
    mode: session.mode,
    count: session.count,
    avgConfidence: session.avgConfidence,
    durationMs: session.durationMs,
    thumbnailUri: session.thumbnailUri,
    notes: session.notes,
    createdAt: session.createdAt,
  };
}

async function uploadOne(session: CountingSession, attempt = 1): Promise<void> {
  const { markSessionSynced, markSessionFailed } = getSessionSyncBridge();
  try {
    await uploadSession(sessionToPayload(session));
    markSessionSynced(session.id);
  } catch (err) {
    if (attempt < MAX_ATTEMPTS) {
      const delay = BASE_DELAY_MS * 2 ** (attempt - 1);
      await new Promise((r) => setTimeout(r, delay));
      return uploadOne(session, attempt + 1);
    }
    const message = err instanceof Error ? err.message : 'Upload failed';
    markSessionFailed(session.id, message);
    throw err;
  }
}

/**
 * Process all pending sessions. No-op when offline unless `force` is true (manual retry).
 */
export async function processSyncQueue(options?: { force?: boolean }): Promise<SyncQueueResult> {
  if (queueState.running) {
    return { synced: 0, failed: 0, skippedOffline: false };
  }

  if (!getIsOnline() && !options?.force) {
    return { synced: 0, failed: 0, skippedOffline: true };
  }

  const pending = getSessionSyncBridge().getPendingSessions();
  if (pending.length === 0) {
    return { synced: 0, failed: 0, skippedOffline: false };
  }

  queueState = { ...queueState, running: true, lastError: null };
  emitState();

  let synced = 0;
  let failed = 0;

  for (const session of pending) {
    try {
      await uploadOne(session);
      synced += 1;
    } catch {
      failed += 1;
    }
  }

  queueState = {
    running: false,
    lastRunAt: Date.now(),
    lastError: failed > 0 ? `${failed} session(s) failed to sync` : null,
    lastSynced: synced,
    lastFailed: failed,
  };
  emitState();

  return { synced, failed, skippedOffline: false };
}
