// oxlint-disable-next-line eslint-plugin-import/no-unassigned-import
import './global.css';

import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/outfit';
import { ThemeProvider } from '@react-navigation/native';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { LIGHT_THEME } from '@/lib/constants';
import { COLORS } from '@/lib/design-system';
import { initPostHog } from '@/lib/posthog';
import { useColorScheme } from '@/hooks/useColorScheme';
import { ToastProvider } from '@/components/ui/toast';

import { SplashScreen, Stack } from 'expo-router';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  const [loaded, error] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
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

  if (!loaded && !error) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.canvas }}>
      <SafeAreaProvider>
        <ThemeProvider value={LIGHT_THEME}>
          <StatusBar style="light" />
          <ToastProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: COLORS.canvas },
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="farm/[id]" options={{ headerShown: true, title: 'Farm details' }} />
              <Stack.Screen name="farm/new" options={{ presentation: 'modal', headerShown: true, title: 'New farm' }} />
              <Stack.Screen name="house/new" options={{ presentation: 'modal', headerShown: true, title: 'New house' }} />
              <Stack.Screen name="count/live" options={{ headerShown: true, title: 'Live count' }} />
              <Stack.Screen name="count/image" options={{ headerShown: true, title: 'Image count' }} />
              <Stack.Screen name="count/video" options={{ headerShown: true, title: 'Video count' }} />
              <Stack.Screen name="reports/index" options={{ headerShown: true, title: 'Reports' }} />
              <Stack.Screen name="subscription" options={{ headerShown: true, title: 'Subscription' }} />
              <Stack.Screen name="profile" options={{ headerShown: true, title: 'Profile' }} />
              <Stack.Screen name="admin" options={{ headerShown: true, title: 'Admin' }} />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
