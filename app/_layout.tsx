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
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIGHT_THEME } from '@/lib/constants';
import { COLORS, FONTS } from '@/lib/design-system';
import { initPostHog } from '@/lib/posthog';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { isExpoGo } from '@/lib/expo-go';
import { useSettingsStore } from '@/lib/stores/settings-store';

import { SplashScreen, Stack } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

const STACK_HEADER = {
  headerShown: true,
  headerStyle: { backgroundColor: COLORS.canvas },
  headerTintColor: COLORS.ink,
  headerTitleStyle: { color: COLORS.ink, fontFamily: FONTS.semibold, fontSize: 17 },
  headerShadowVisible: false,
  contentStyle: { backgroundColor: COLORS.canvas },
} as const;

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
              <Stack.Screen name="farm/[id]" options={{ ...STACK_HEADER, title: 'Farm details' }} />
              <Stack.Screen name="farm/new" options={{ ...STACK_HEADER, presentation: 'modal', title: 'New farm' }} />
              <Stack.Screen name="house/new" options={{ ...STACK_HEADER, presentation: 'modal', title: 'New house' }} />
              <Stack.Screen name="reports/index" options={{ ...STACK_HEADER, title: 'Reports' }} />
              <Stack.Screen name="subscription" options={{ ...STACK_HEADER, title: 'Subscription' }} />
              <Stack.Screen name="profile" options={{ ...STACK_HEADER, title: 'Profile' }} />
              <Stack.Screen name="admin" options={{ ...STACK_HEADER, title: 'Admin' }} />
              <Stack.Screen name="cctv/add-feed" options={{ ...STACK_HEADER, presentation: 'modal', title: 'Add CCTV feed' }} />
            </Stack>
            </ErrorBoundary>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
