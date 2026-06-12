// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import './global.css';

import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';
import { Fraunces_700Bold } from '@expo-google-fonts/fraunces';
import { useFonts } from 'expo-font';
import { ThemeProvider } from '@react-navigation/native';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIGHT_THEME } from '@/lib/constants';
import { COLORS } from '@/lib/design-system';
import { initPostHog } from '@/lib/posthog';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QueryProvider } from '@/providers/query-provider';
import { isExpoGo } from '@/lib/expo-go';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useAuthStore } from '@/lib/stores/auth-store';
import { syncSubscriptionOnLaunch } from '@/lib/subscription/service';

import { SplashScreen, Stack } from 'expo-router';

void SplashScreen.preventAutoHideAsync();



export default function RootLayout() {
  const { setColorScheme } = useColorScheme();
  const pushEnabled = useSettingsStore((s) => s.pushEnabled);

  const [loaded, error] = useFonts({
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
    Fraunces_700Bold,
  });

  useEffect(() => {
    setColorScheme('dark');
    void AsyncStorage.setItem('theme', 'dark').catch(() => {});
  }, [setColorScheme]);

  useEffect(() => {
    if (loaded || error) {
      void SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  useEffect(() => {
    initPostHog();
  }, []);

  const authHydrated = useAuthStore((s) => s.hydrated);
  const user = useAuthStore((s) => s.user);

  // Use a ref to ensure syncSubscriptionOnLaunch only runs once per session.
  // The effect deps include user but applyPlan() mutates user.tier, which would
  // re-trigger the effect — the ref prevents that infinite loop.
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!authHydrated || !user || syncedRef.current) return;
    syncedRef.current = true;
    void syncSubscriptionOnLaunch(user.id, user.tier);
  }, [authHydrated, user?.id]); // depend on id only — tier changes must not retrigger

  useEffect(() => {
    if (!pushEnabled || isExpoGo()) return;
    void import('@/lib/notifications')
      .then((m) => m.registerForPushNotifications())
      .catch((err) => {
        console.warn('Failed to register for push notifications:', err);
        // Notifications are optional, so we just log the error
      });
  }, [pushEnabled]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <SafeAreaProvider>
        <ThemeProvider value={LIGHT_THEME}>
          <StatusBar style="light" />
          <ToastProvider>
            <QueryProvider>
            <ErrorBoundary>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: COLORS.canvas },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" options={{ animation: 'fade' }} />
              <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="farm/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="farm/new" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="house/new" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="cctv/add-feed" options={{ presentation: 'modal', headerShown: false }} />
              {/* Farm ops: custom TopBar only — no native header (avoids double back) */}
              <Stack.Screen name="operations/index" options={{ headerShown: false }} />
              <Stack.Screen name="animals/index" options={{ headerShown: false }} />
              <Stack.Screen name="animals/new" options={{ headerShown: false, presentation: 'modal' }} />
              <Stack.Screen name="animals/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="tasks/index" options={{ headerShown: false }} />
              <Stack.Screen name="feed/index" options={{ headerShown: false }} />
              <Stack.Screen name="health/index" options={{ headerShown: false }} />
              <Stack.Screen name="sales/index" options={{ headerShown: false }} />
              <Stack.Screen name="disease-scan" options={{ headerShown: false }} />
              <Stack.Screen name="vet/index" options={{ headerShown: false }} />
              <Stack.Screen name="security/index" options={{ headerShown: false }} />
            </Stack>
            </ErrorBoundary>
            </QueryProvider>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
