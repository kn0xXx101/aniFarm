import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Farm, LivestockPen } from '@/types/domain';

interface FarmState {
  farms: Farm[];
  houses: LivestockPen[];
  selectedFarmId: string | null;
  addFarm: (input: Omit<Farm, 'id' | 'createdAt' | 'ownerId'> & { ownerId?: string }) => Farm;
  updateFarm: (id: string, patch: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  selectFarm: (id: string | null) => void;
  addHouse: (input: Omit<LivestockPen, 'id'>) => LivestockPen;
  updateHouse: (id: string, patch: Partial<LivestockPen>) => void;
  deleteHouse: (id: string) => void;
  housesForFarm: (farmId: string) => LivestockPen[];
}

let counter = 0;
const nextId = (prefix: string) => `${prefix}${++counter}_${Date.now()}`;

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      farms: [],
      houses: [],
      selectedFarmId: null,

      addFarm: (input) => {
        const livestockType = input.livestockType ?? input.flockType ?? 'mixed';
        const farm: Farm = {
          id: nextId('f'),
          ownerId: input.ownerId ?? '',
          name: input.name,
          location: input.location,
          coords: input.coords,
          imageUrl: input.imageUrl,
          capacity: input.capacity,
          livestockType,
          flockType: livestockType,
          createdAt: Date.now(),
        };
        set((s) => ({
          farms: [farm, ...s.farms],
          selectedFarmId: s.selectedFarmId ?? farm.id,
        }));
        return farm;
      },

      updateFarm: (id, patch) =>
        set((s) => ({ farms: s.farms.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),

      deleteFarm: (id) =>
        set((s) => ({
          farms: s.farms.filter((f) => f.id !== id),
          houses: s.houses.filter((h) => h.farmId !== id),
          selectedFarmId: s.selectedFarmId === id ? (s.farms.find((f) => f.id !== id)?.id ?? null) : s.selectedFarmId,
        })),

      selectFarm: (id) => set({ selectedFarmId: id }),

      addHouse: (input) => {
        const house: LivestockPen = { id: nextId('h'), ...input };
        set((s) => ({ houses: [...s.houses, house] }));
        return house;
      },

      updateHouse: (id, patch) =>
        set((s) => ({ houses: s.houses.map((h) => (h.id === id ? { ...h, ...patch } : h)) })),

      deleteHouse: (id) =>
        set((s) => ({ houses: s.houses.filter((h) => h.id !== id) })),

      housesForFarm: (farmId) => get().houses.filter((h) => h.farmId === farmId),
    }),
    {
      name: 'poultra-farms',
      storage: createJSONStorage(() => AsyncStorage),
      migrate: (persisted: unknown) => {
        const state = persisted as { farms?: Farm[]; houses?: LivestockPen[] };
        if (state?.farms) {
          state.farms = state.farms.map((f) => {
            const legacy = f as Farm & { flockType?: Farm['livestockType'] };
            const livestockType = legacy.livestockType ?? legacy.flockType ?? 'mixed';
            return { ...legacy, livestockType, flockType: livestockType };
          });
        }
        return state as unknown as FarmState;
      },
    },
  ),
);
