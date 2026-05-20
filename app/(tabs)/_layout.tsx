import { Tabs } from 'expo-router';
import { Home, ScanLine, Warehouse, User, Tv2 } from 'lucide-react-native';

import { IosGlassTabBar } from '@/components/shell/ios-glass-tab-bar';
import { COLORS } from '@/lib/design-system';
import { getDefaultTabBarStyle } from '@/lib/tab-bar-style';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      initialRouteName="dashboard"
      tabBar={(props) => <IosGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inkMuted,
        tabBarAllowFontScaling: false,
        tabBarStyle: getDefaultTabBarStyle(insets.bottom),
        sceneStyle: {
          backgroundColor: COLORS.canvas,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }} />
      <Tabs.Screen name="cctv" options={{ title: 'CCTV', tabBarIcon: ({ color, size }) => <Tv2 color={color} size={size} /> }} />
      <Tabs.Screen name="farms" options={{ title: 'Farms', tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="count-live" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="count-image" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="count-video" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
