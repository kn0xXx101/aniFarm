import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CountingSession, CountingMode } from '@/types/domain';
import { MOCK_SESSIONS } from '@/lib/mock-data';

interface SessionState {
  sessions: CountingSession[];
  pendingSyncCount: () => number;
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
  syncPending: () => Promise<number>;
  clear: () => void;
}

let n = 1000;
const nextId = () => `s${++n}`;

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessions: MOCK_SESSIONS,
      pendingSyncCount: () => get().sessions.filter((s) => s.syncStatus === 'pending').length,
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
      syncPending: async () => {
        const pending = get().sessions.filter((s) => s.syncStatus === 'pending');
        await new Promise((r) => setTimeout(r, 800));
        set((s) => ({
          sessions: s.sessions.map((x) => (x.syncStatus === 'pending' ? { ...x, syncStatus: 'synced' } : x)),
        }));
        return pending.length;
      },
      clear: () => set({ sessions: [] }),
    }),
    {
      name: 'poultra-sessions',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
