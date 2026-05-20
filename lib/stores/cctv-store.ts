/**
 * CCTV feed store — persists feed configuration, holds live runtime state.
 *
 * Feed config (streamUrl, name, interval) is persisted to AsyncStorage.
 * Runtime state (status, lastCount, lastCountedAt) is in-memory only.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { CctvFeed, CctvFeedStatus, CctvCountUpdate } from '@/types/domain';

interface CctvState {
  feeds: CctvFeed[];
  // Runtime state keyed by feedId
  runtime: Record<string, {
    status: CctvFeedStatus;
    lastCount?: number;
    lastCountedAt?: number;
    avgConfidence?: number;
  }>;

  addFeed: (input: Omit<CctvFeed, 'id' | 'createdAt' | 'status' | 'lastCount' | 'lastCountedAt' | 'avgConfidence'>) => CctvFeed;
  updateFeed: (id: string, patch: Partial<Omit<CctvFeed, 'id' | 'createdAt'>>) => void;
  deleteFeed: (id: string) => void;
  toggleFeed: (id: string) => void;

  // Runtime mutations
  setFeedStatus: (id: string, status: CctvFeedStatus) => void;
  applyCountUpdate: (update: CctvCountUpdate) => void;

  feedsForFarm: (farmId: string) => CctvFeed[];
  feedsForHouse: (houseId: string) => CctvFeed[];
}

let counter = 0;
const nextId = () => `cctv${++counter}_${Date.now()}`;

export const useCctvStore = create<CctvState>()(
  persist(
    (set, get) => ({
      feeds: [],
      runtime: {},

      addFeed: (input) => {
        const feed: CctvFeed = {
          id: nextId(),
          createdAt: Date.now(),
          ...input,
        };
        set((s) => ({ feeds: [feed, ...s.feeds] }));
        return feed;
      },

      updateFeed: (id, patch) =>
        set((s) => ({
          feeds: s.feeds.map((f) => (f.id === id ? { ...f, ...patch } : f)),
        })),

      deleteFeed: (id) =>
        set((s) => ({
          feeds: s.feeds.filter((f) => f.id !== id),
          runtime: Object.fromEntries(
            Object.entries(s.runtime).filter(([k]) => k !== id),
          ),
        })),

      toggleFeed: (id) =>
        set((s) => ({
          feeds: s.feeds.map((f) => (f.id === id ? { ...f, enabled: !f.enabled } : f)),
        })),

      setFeedStatus: (id, status) =>
        set((s) => ({
          runtime: { ...s.runtime, [id]: { ...s.runtime[id], status } },
        })),

      applyCountUpdate: (update) =>
        set((s) => ({
          runtime: {
            ...s.runtime,
            [update.feedId]: {
              status: 'online',
              lastCount: update.count,
              lastCountedAt: update.countedAt,
              avgConfidence: update.avgConfidence,
            },
          },
        })),

      feedsForFarm: (farmId) => get().feeds.filter((f) => f.farmId === farmId),
      feedsForHouse: (houseId) => get().feeds.filter((f) => f.houseId === houseId),
    }),
    {
      name: 'poultra-cctv',
      storage: createJSONStorage(() => AsyncStorage),
      // Only persist config, not runtime state
      partialize: (s) => ({ feeds: s.feeds }),
    },
  ),
);
