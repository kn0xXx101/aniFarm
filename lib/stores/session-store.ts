import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountingSession, CountingMode } from '@/types/domain';
import { registerSessionSyncBridge } from '@/lib/sync/session-bridge';
import { recordCountSessionCompleted } from '@/lib/subscription/service';

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
    aliveCount?: number;
    deadCount?: number;
    excludedHumans?: number;
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

let n = 0;
const nextId = () => `s${++n}_${Date.now()}`;

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: [],

      pendingSyncCount: () =>
        get().sessions.filter((s) => s.syncStatus === 'pending').length,

      failedSyncCount: () =>
        get().sessions.filter((s) => s.syncStatus === 'failed').length,

      getPendingSessions: () =>
        get().sessions.filter((s) => s.syncStatus === 'pending'),

      addSession: (input) => {
        const aliveCount = input.aliveCount ?? input.count;
        const session: CountingSession = {
          id: nextId(),
          farmId: input.farmId,
          houseId: input.houseId,
          mode: input.mode,
          count: aliveCount,
          aliveCount,
          deadCount: input.deadCount ?? 0,
          excludedHumans: input.excludedHumans ?? 0,
          avgConfidence: input.avgConfidence,
          durationMs: input.durationMs,
          thumbnailUri: input.thumbnailUri,
          notes: input.notes,
          createdAt: Date.now(),
          syncStatus: 'pending',
        };
        set((s) => ({ sessions: [session, ...s.sessions] }));
        recordCountSessionCompleted();
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
      migrate: (persisted: unknown) => {
        const state = persisted as { sessions?: CountingSession[] };
        if (state?.sessions) {
          state.sessions = state.sessions.map((s) => ({
            ...s,
            aliveCount: s.aliveCount ?? s.count,
            deadCount: s.deadCount ?? 0,
            excludedHumans: s.excludedHumans ?? 0,
          }));
        }
        return state as SessionState;
      },
    },
  ),
);

registerSessionSyncBridge({
  getPendingSessions: () => useSessionStore.getState().getPendingSessions(),
  markSessionSynced: (id) => useSessionStore.getState().markSessionSynced(id),
  markSessionFailed: (id, error) => useSessionStore.getState().markSessionFailed(id, error),
});
