import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { User, SubscriptionTier } from '@/types/domain';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  hydrated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  register: (input: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    role?: User['role'];
  }) => Promise<void>;
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

      signIn: async (email, _password) => {
        // TODO: replace with real auth provider (Firebase / Supabase)
        await new Promise((r) => setTimeout(r, 400));
        const user: User = {
          id: `user-${Date.now()}`,
          name: email.split('@')[0]?.replace(/[._-]/g, ' ') || 'Operator',
          email,
          role: 'farmer',
          tier: 'free',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true, isOnboarded: true });
      },

      signInWithGoogle: async () => {
        // TODO: replace with real Google OAuth (expo-auth-session + Firebase)
        await new Promise((r) => setTimeout(r, 500));
        const user: User = {
          id: `google-${Date.now()}`,
          name: 'Demo User',
          email: 'demo@anifarm.app',
          role: 'farmer',
          tier: 'pro',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true, isOnboarded: true });
      },

      signInWithPhone: async (phone) => {
        // TODO: replace with real SMS OTP (Firebase Phone Auth)
        await new Promise((r) => setTimeout(r, 400));
        const user: User = {
          id: `phone-${Date.now()}`,
          name: 'Operator',
          email: '',
          phone,
          role: 'farmer',
          tier: 'free',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true, isOnboarded: true });
      },

      register: async ({ name, email, phone, password: _password, role = 'farmer' }) => {
        // TODO: replace with real auth provider
        await new Promise((r) => setTimeout(r, 500));
        const user: User = {
          id: `user-${Date.now()}`,
          name,
          email,
          phone,
          role,
          tier: 'pro',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true, isOnboarded: true });
      },

      signOut: () => set({ user: null, isAuthenticated: false }),
      completeOnboarding: () => set({ isOnboarded: true }),
      updateProfile: (patch) =>
        set((s) => ({ user: s.user ? { ...s.user, ...patch } : s.user })),
      setTier: (tier) =>
        set((s) => ({ user: s.user ? { ...s.user, tier } : s.user })),
      setHydrated: () => set({ hydrated: true }),
    }),
    {
      name: 'poultra-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        user: s.user,
        isAuthenticated: s.isAuthenticated,
        isOnboarded: s.isOnboarded,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);
