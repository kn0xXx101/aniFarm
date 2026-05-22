import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SubscriptionTier } from '@/types/domain';

function periodKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

interface SubscriptionState {
  /** ISO month bucket for count usage reset */
  countsPeriodKey: string;
  monthlyCountsUsed: number;
  trialEndsAt: number | null;
  subscribedAt: number | null;
  enterpriseInquiryAt: number | null;

  resetPeriodIfNeeded: () => void;
  incrementCountUsage: () => void;
  startProTrial: (days: number) => void;
  setBillingMeta: (patch: { subscribedAt?: number | null; enterpriseInquiryAt?: number | null }) => void;
  clearTrial: () => void;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      countsPeriodKey: periodKey(),
      monthlyCountsUsed: 0,
      trialEndsAt: null,
      subscribedAt: null,
      enterpriseInquiryAt: null,

      resetPeriodIfNeeded: () => {
        const key = periodKey();
        if (get().countsPeriodKey !== key) {
          set({ countsPeriodKey: key, monthlyCountsUsed: 0 });
        }
      },

      incrementCountUsage: () => {
        get().resetPeriodIfNeeded();
        set((s) => ({ monthlyCountsUsed: s.monthlyCountsUsed + 1 }));
      },

      startProTrial: (days) => {
        const ends = Date.now() + days * 86400000;
        set({ trialEndsAt: ends, subscribedAt: null });
      },

      setBillingMeta: (patch) => set((s) => ({ ...s, ...patch })),

      clearTrial: () => set({ trialEndsAt: null }),
    }),
    {
      name: 'anifarm-subscription',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
