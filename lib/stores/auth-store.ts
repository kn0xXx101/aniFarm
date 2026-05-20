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
  register: (input: { name: string; email: string; phone?: string; password: string }) => Promise<void>;
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
        // Example: const { user } = await signInWithEmailAndPassword(auth, email, password);
        const user: User = {
          id: '',
          name: '',
          email,
          role: 'farmer',
          tier: 'free',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true });
      },

      signInWithGoogle: async () => {
        // TODO: replace with real Google OAuth (expo-auth-session + Firebase)
        throw new Error('Google sign-in not yet configured. Set up Firebase Auth.');
      },

      signInWithPhone: async (_phone) => {
        // TODO: replace with real SMS OTP (Firebase Phone Auth)
        throw new Error('Phone sign-in not yet configured. Set up Firebase Phone Auth.');
      },

      register: async ({ name, email, phone, password: _password }) => {
        // TODO: replace with real auth provider
        // Example: const { user } = await createUserWithEmailAndPassword(auth, email, password);
        const user: User = {
          id: '',
          name,
          email,
          phone,
          role: 'farmer',
          tier: 'free',
          createdAt: Date.now(),
        };
        set({ user, isAuthenticated: true });
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
