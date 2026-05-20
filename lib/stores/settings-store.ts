import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  pushEnabled: boolean;
  emailEnabled: boolean;
  mortalityThreshold: number; // birds per 24h
  densityThreshold: number; // birds per m^2
  language: 'en' | 'fr' | 'sw';
  autoSync: boolean;
  toggle: (k: 'pushEnabled' | 'emailEnabled' | 'autoSync') => void;
  setThreshold: (k: 'mortalityThreshold' | 'densityThreshold', v: number) => void;
  setLanguage: (v: 'en' | 'fr' | 'sw') => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      pushEnabled: true,
      emailEnabled: false,
      mortalityThreshold: 10,
      densityThreshold: 12,
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
