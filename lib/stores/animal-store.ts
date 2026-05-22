import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Animal, AnimalBatch, AnimalSpecies } from '@/types/domain';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function tagFor(species: AnimalSpecies, n: number) {
  return `${species.slice(0, 3).toUpperCase()}-${String(n).padStart(4, '0')}`;
}

interface AnimalState {
  animals: Animal[];
  batches: AnimalBatch[];
  addAnimal: (input: Omit<Animal, 'id' | 'tagId' | 'createdAt' | 'updatedAt'> & { tagId?: string }) => Animal;
  addBatch: (input: Omit<AnimalBatch, 'id'>) => AnimalBatch;
  updateAnimal: (id: string, patch: Partial<Animal>) => void;
  removeAnimal: (id: string) => void;
  animalsByFarm: (farmId: string) => Animal[];
  speciesCounts: (farmId?: string) => Record<string, number>;
}

export const useAnimalStore = create<AnimalState>()(
  persist(
    (set, get) => ({
      animals: [],
      batches: [],

      addAnimal: (input) => {
        const count = get().animals.filter((a) => a.farmId === input.farmId).length + 1;
        const now = Date.now();
        const animal: Animal = {
          ...input,
          id: uid('animal'),
          tagId: input.tagId ?? tagFor(input.species, count),
          healthStatus: input.healthStatus ?? 'healthy',
          vaccinationStatus: input.vaccinationStatus ?? 'current',
          gender: input.gender ?? 'unknown',
          createdAt: now,
          updatedAt: now,
        };
        set((s) => ({ animals: [animal, ...s.animals] }));
        return animal;
      },

      addBatch: (input) => {
        const batch: AnimalBatch = { ...input, id: uid('batch') };
        set((s) => ({ batches: [batch, ...s.batches] }));
        return batch;
      },

      updateAnimal: (id, patch) => {
        set((s) => ({
          animals: s.animals.map((a) =>
            a.id === id ? { ...a, ...patch, updatedAt: Date.now() } : a,
          ),
        }));
      },

      removeAnimal: (id) => {
        set((s) => ({ animals: s.animals.filter((a) => a.id !== id) }));
      },

      animalsByFarm: (farmId) => get().animals.filter((a) => a.farmId === farmId),

      speciesCounts: (farmId) => {
        const list = farmId ? get().animals.filter((a) => a.farmId === farmId) : get().animals;
        const out: Record<string, number> = {};
        for (const a of list) {
          out[a.species] = (out[a.species] ?? 0) + 1;
        }
        return out;
      },
    }),
    { name: 'anifarm-animals', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
