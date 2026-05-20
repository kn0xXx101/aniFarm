import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, SubscriptionTier } from '@/types/domain';
import { MOCK_USER } from '@/lib/mock-data';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  hydrated: boolean;
  signIn: (email: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  register: (input: { name: string; email: string; phone?: string }) => Promise<void>;
  signOut: () => void;
  completeOnboarding: () => void;
  updateProfile: (patch: Partial<User>) => void;
  setTier: (tier: SubscriptionTier) => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isOnboarded: false,
      hydrated: false,
      signIn: async (email) => {
        await new Promise((r) => setTimeout(r, 500));
        set({ user: { ...MOCK_USER, email }, isAuthenticated: true });
      },
      signInWithGoogle: async () => {
        await new Promise((r) => setTimeout(r, 600));
        set({ user: MOCK_USER, isAuthenticated: true });
      },
      signInWithPhone: async (phone) => {
        await new Promise((r) => setTimeout(r, 400));
        set({ user: { ...MOCK_USER, phone }, isAuthenticated: true });
      },
      register: async ({ name, email, phone }) => {
        await new Promise((r) => setTimeout(r, 600));
        set({
          user: { ...MOCK_USER, name, email, phone, createdAt: Date.now() },
          isAuthenticated: true,
        });
      },
      signOut: () => set({ user: null, isAuthenticated: false }),
      completeOnboarding: () => set({ isOnboarded: true }),
      updateProfile: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      setTier: (tier) => set((s) => ({ user: s.user ? { ...s.user, tier } : s.user })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'poultra-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, isOnboarded: s.isOnboarded }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
