import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  BreedingRecord,
  DiseaseScan,
  FarmTask,
  FeedLog,
  FeedStock,
  MortalityLog,
  SaleRecord,
  VaccinationRecord,
  VetConsultation,
  WeightLog,
} from '@/types/domain';

function uid(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface OperationsState {
  tasks: FarmTask[];
  feedStock: FeedStock[];
  feedLogs: FeedLog[];
  vaccinations: VaccinationRecord[];
  weightLogs: WeightLog[];
  mortalityLogs: MortalityLog[];
  breeding: BreedingRecord[];
  sales: SaleRecord[];
  diseaseScans: DiseaseScan[];
  vetConsults: VetConsultation[];

  addTask: (t: Omit<FarmTask, 'id' | 'createdAt' | 'status'> & { status?: FarmTask['status'] }) => void;
  toggleTask: (id: string) => void;
  addFeedStock: (s: Omit<FeedStock, 'id' | 'updatedAt'>) => void;
  restockFeed: (feedId: string, amountKg: number) => void;
  logFeed: (l: Omit<FeedLog, 'id'>) => void;
  addVaccination: (v: Omit<VaccinationRecord, 'id'>) => void;
  addWeight: (w: Omit<WeightLog, 'id'>) => void;
  addMortality: (m: Omit<MortalityLog, 'id'>) => void;
  addBreeding: (b: Omit<BreedingRecord, 'id'>) => void;
  addSale: (s: Omit<SaleRecord, 'id'>) => void;
  addDiseaseScan: (d: Omit<DiseaseScan, 'id' | 'createdAt'>) => void;
  addVetConsult: (v: Omit<VetConsultation, 'id' | 'createdAt' | 'status'> & { status?: VetConsultation['status'] }) => void;

  pendingTasks: (farmId?: string) => number;
  feedLowCount: (farmId?: string) => number;
  vaccinationsDue: (farmId?: string) => number;
  totalRevenue: (farmId?: string) => number;
  sickCount: () => number;
}

export const useOperationsStore = create<OperationsState>()(
  persist(
    (set, get) => ({
      tasks: [],
      feedStock: [],
      feedLogs: [],
      vaccinations: [],
      weightLogs: [],
      mortalityLogs: [],
      breeding: [],
      sales: [],
      diseaseScans: [],
      vetConsults: [],

      addTask: (t) => {
        const task: FarmTask = {
          ...t,
          id: uid('task'),
          status: t.status ?? 'pending',
          createdAt: Date.now(),
        };
        set((s) => ({ tasks: [task, ...s.tasks] }));
      },

      toggleTask: (id) => {
        set((s) => ({
          tasks: s.tasks.map((t) =>
            t.id === id
              ? { ...t, status: t.status === 'done' ? 'pending' : 'done' }
              : t,
          ),
        }));
      },

      addFeedStock: (stock) => {
        set((s) => ({
          feedStock: [
            { ...stock, id: uid('feed'), updatedAt: Date.now() },
            ...s.feedStock,
          ],
        }));
      },

      restockFeed: (feedId, amountKg) => {
        set((s) => ({
          feedStock: s.feedStock.map((f) =>
            f.id === feedId
              ? { ...f, quantityKg: f.quantityKg + amountKg, updatedAt: Date.now() }
              : f,
          ),
        }));
      },

      logFeed: (log) => {
        set((s) => ({
          feedLogs: [{ ...log, id: uid('flog') }, ...s.feedLogs],
          feedStock: s.feedStock.map((f) =>
            f.id === log.feedId
              ? { ...f, quantityKg: Math.max(0, f.quantityKg - log.amountKg), updatedAt: Date.now() }
              : f,
          ),
        }));
      },

      addVaccination: (v) => {
        set((s) => ({ vaccinations: [{ ...v, id: uid('vac') }, ...s.vaccinations] }));
      },

      addWeight: (w) => {
        set((s) => ({ weightLogs: [{ ...w, id: uid('wt') }, ...s.weightLogs] }));
      },

      addMortality: (m) => {
        set((s) => ({ mortalityLogs: [{ ...m, id: uid('mort') }, ...s.mortalityLogs] }));
      },

      addBreeding: (b) => {
        set((s) => ({ breeding: [{ ...b, id: uid('breed') }, ...s.breeding] }));
      },

      addSale: (sale) => {
        set((s) => ({ sales: [{ ...sale, id: uid('sale') }, ...s.sales] }));
      },

      addDiseaseScan: (d) => {
        set((s) => ({
          diseaseScans: [{ ...d, id: uid('dis'), createdAt: Date.now() }, ...s.diseaseScans],
        }));
      },

      addVetConsult: (v) => {
        set((s) => ({
          vetConsults: [
            { ...v, id: uid('vet'), status: v.status ?? 'open', createdAt: Date.now() },
            ...s.vetConsults,
          ],
        }));
      },

      pendingTasks: (farmId) =>
        get().tasks.filter(
          (t) => t.status !== 'done' && t.status !== 'cancelled' && (!farmId || t.farmId === farmId),
        ).length,

      feedLowCount: (farmId) =>
        get().feedStock.filter(
          (f) => f.quantityKg <= f.lowThresholdKg && (!farmId || f.farmId === farmId),
        ).length,

      vaccinationsDue: (farmId) => {
        const now = Date.now();
        return get().vaccinations.filter(
          (v) =>
            !v.administeredAt &&
            v.dueAt <= now + 7 * 86400000 &&
            (!farmId || v.farmId === farmId),
        ).length;
      },

      totalRevenue: (farmId) =>
        get()
          .sales.filter((s) => !farmId || s.farmId === farmId)
          .reduce((sum, s) => sum + s.revenue, 0),

      sickCount: () => 0,
    }),
    { name: 'anifarm-operations', storage: createJSONStorage(() => AsyncStorage) },
  ),
);
