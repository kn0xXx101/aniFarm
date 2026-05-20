import { Tabs } from 'expo-router';
import { Home, ScanLine, Warehouse, User } from 'lucide-react-native';

import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

export default function TabLayout() {
  return (
    <Tabs
      initialRouteName="dashboard"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inkMuted,
        tabBarLabelStyle: {
          fontFamily: FONTS.semibold,
          fontSize: 11,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
        tabBarStyle: {
          position: 'absolute',
          height: LAYOUT.tabBarHeight,
          paddingTop: 6,
          paddingBottom: typeof window !== 'undefined' ? 10 : 20,
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.borderSoft,
          borderTopWidth: 1,
          elevation: 0,
        },
        sceneStyle: {
          backgroundColor: COLORS.canvas,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }} />
      <Tabs.Screen name="farms" options={{ title: 'Farms', tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="count-live" options={{ href: null }} />
      <Tabs.Screen name="count-image" options={{ href: null, tabBarStyle: { display: 'none' } }} />
      <Tabs.Screen name="count-video" options={{ href: null, tabBarStyle: { display: 'none' } }} />
    </Tabs>
  );
}
