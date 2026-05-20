import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountingSession, CountingMode } from '@/types/domain';
import { MOCK_SESSIONS } from '@/lib/mock-data';
import { registerSessionSyncBridge } from '@/lib/sync/session-bridge';

interface SessionState {
  sessions: CountingSession[];
  pendingSyncCount: () => number;
  failedSyncCount: () => number;
  getPendingSessions: () => CountingSession[];
  addSession: (input: {
    farmId: string;
    houseId?: string;
    mode: CountingMode;
    count: number;
    avgConfidence: number;
    durationMs: number;
    thumbnailUri?: string;
    notes?: string;
  }) => CountingSession;
  markSessionSynced: (id: string) => void;
  markSessionFailed: (id: string, error: string) => void;
  retryFailed: (id: string) => void;
  syncPending: (options?: { force?: boolean }) => Promise<number>;
  clear: () => void;
}

let n = 1000;
const nextId = () => `s${++n}`;

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: MOCK_SESSIONS,
      pendingSyncCount: () => get().sessions.filter((s) => s.syncStatus === 'pending').length,
      failedSyncCount: () => get().sessions.filter((s) => s.syncStatus === 'failed').length,
      getPendingSessions: () => get().sessions.filter((s) => s.syncStatus === 'pending'),
      addSession: (input) => {
        const session: CountingSession = {
          id: nextId(),
          farmId: input.farmId,
          houseId: input.houseId,
          mode: input.mode,
          count: input.count,
          avgConfidence: input.avgConfidence,
          durationMs: input.durationMs,
          thumbnailUri: input.thumbnailUri,
          notes: input.notes,
          createdAt: Date.now(),
          syncStatus: 'pending',
        };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        return session;
      },
      markSessionSynced: (id) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, syncStatus: 'synced' as const, syncError: undefined } : x,
          ),
        })),
      markSessionFailed: (id, error) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, syncStatus: 'failed' as const, syncError: error } : x,
          ),
        })),
      retryFailed: (id) =>
        set((s) => ({
          sessions: s.sessions.map((x) =>
            x.id === id ? { ...x, syncStatus: 'pending' as const, syncError: undefined } : x,
          ),
        })),
      syncPending: async (options) => {
        const { processSyncQueue } = await import('@/lib/sync/queue');
        const result = await processSyncQueue(options);
        return result.synced;
      },
      clear: () => set({ sessions: [] }),
    }),
    {
      name: 'poultra-sessions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

registerSessionSyncBridge({
  getPendingSessions: () => useSessionStore.getState().getPendingSessions(),
  markSessionSynced: (id) => useSessionStore.getState().markSessionSynced(id),
  markSessionFailed: (id, error) => useSessionStore.getState().markSessionFailed(id, error),
});
