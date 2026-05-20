import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushEnabled: boolean;
  emailEnabled: boolean;
  mortalityThreshold: number; // losses per 7d
  densityThreshold: number; // capacity % threshold
  /** Minimum dead animals in one detection to raise an alert */
  deadAlertMin: number;
  language: 'en' | 'fr' | 'sw';
  autoSync: boolean;
  toggle: (k: 'pushEnabled' | 'emailEnabled' | 'autoSync') => void;
  setThreshold: (k: 'mortalityThreshold' | 'densityThreshold' | 'deadAlertMin', v: number) => void;
  setLanguage: (v: 'en' | 'fr' | 'sw') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pushEnabled: true,
      emailEnabled: false,
      mortalityThreshold: 10,
      densityThreshold: 12,
      deadAlertMin: 1,
      language: 'en',
      autoSync: true,
      toggle: (k) => set((s) => ({ [k]: !s[k] }) as Partial<SettingsState>),
      setThreshold: (k, v) => set({ [k]: v } as Partial<SettingsState>),
      setLanguage: (v) => set({ language: v }),
    }),
    {
      name: 'poultra-settings',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
