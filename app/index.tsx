import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/lib/stores/auth-store';
import { COLORS } from '@/lib/design-system';

/**
 * Splash router — welcome landing → onboarding → auth → tabs.
 */
export default function Index() {
  const hydrated = useAuthStore((s) => s.hydrated);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isOnboarded = useAuthStore((s) => s.isOnboarded);

  if (!hydrated) {
    return (
      <View className="flex-1 items-center justify-center" style={{ backgroundColor: COLORS.canvas }}>
        <ActivityIndicator color={COLORS.primary} />
      </View>
    );
  }
  if (!isOnboarded) return <Redirect href="/welcome" />;
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(tabs)/dashboard" />;
}
