import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Farm, PoultryHouse } from '@/types/domain';
import { MOCK_FARMS, MOCK_HOUSES } from '@/lib/mock-data';

interface FarmState {
  farms: Farm[];
  houses: PoultryHouse[];
  selectedFarmId: string | null;
  addFarm: (input: Omit<Farm, 'id' | 'createdAt' | 'ownerId'> & { ownerId?: string }) => Farm;
  updateFarm: (id: string, patch: Partial<Farm>) => void;
  deleteFarm: (id: string) => void;
  selectFarm: (id: string | null) => void;
  addHouse: (input: Omit<PoultryHouse, 'id'>) => PoultryHouse;
  updateHouse: (id: string, patch: Partial<PoultryHouse>) => void;
  deleteHouse: (id: string) => void;
  housesForFarm: (farmId: string) => PoultryHouse[];
}

let counter = 100;
const nextId = (prefix: string) => `${prefix}${++counter}`;

export const useFarmStore = create<FarmState>()(
  persist(
    (set, get) => ({
      farms: MOCK_FARMS,
      houses: MOCK_HOUSES,
      selectedFarmId: MOCK_FARMS[0]?.id ?? null,
      addFarm: (input) => {
        const farm: Farm = {
          id: nextId('f'),
          ownerId: input.ownerId ?? 'u1',
          name: input.name,
          location: input.location,
          coords: input.coords,
          imageUrl: input.imageUrl,
          capacity: input.capacity,
          flockType: input.flockType,
          createdAt: Date.now(),
        };
        set((s) => ({ farms: [farm, ...s.farms], selectedFarmId: farm.id }));
        return farm;
      },
      updateFarm: (id, patch) =>
        set((s) => ({ farms: s.farms.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
      deleteFarm: (id) =>
        set((s) => ({
          farms: s.farms.filter((f) => f.id !== id),
          houses: s.houses.filter((h) => h.farmId !== id),
          selectedFarmId: s.selectedFarmId === id ? null : s.selectedFarmId,
        })),
      selectFarm: (id) => set({ selectedFarmId: id }),
      addHouse: (input) => {
        const house: PoultryHouse = { id: nextId('h'), ...input };
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
    },
  ),
);
