import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Alert } from '@/types/domain';
import { MOCK_ALERTS } from '@/lib/mock-data';

interface AlertState {
  alerts: Alert[];
  unreadCount: () => number;
  addAlert: (input: Omit<Alert, 'id' | 'createdAt' | 'read'>) => Alert;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
}

let n = 5000;
const nextId = () => `a${++n}`;

export const useAlertStore = create<AlertState>()(
  persist(
    (set, get) => ({
      alerts: MOCK_ALERTS,
      unreadCount: () => get().alerts.filter((a) => !a.read).length,
      addAlert: (input) => {
        const a: Alert = { id: nextId(), createdAt: Date.now(), read: false, ...input };
        set((s) => ({ alerts: [a, ...s.alerts] }));
        return a;
      },
      markRead: (id) =>
        set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, read: true } : a)) })),
      markAllRead: () =>
        set((s) => ({ alerts: s.alerts.map((a) => ({ ...a, read: true })) })),
      remove: (id) => set((s) => ({ alerts: s.alerts.filter((a) => a.id !== id) })),
    }),
    {
      name: 'poultra-alerts',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
