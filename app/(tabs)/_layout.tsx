import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Home, ScanLine, Warehouse, User } from 'lucide-react-native';

import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';

export default function TabLayout() {
  return (
    <Tabs
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
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
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
      <Tabs.Screen name="count" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <ScanLine color={color} size={size} /> }} />
      <Tabs.Screen name="farms" options={{ title: 'Farms', tabBarIcon: ({ color, size }) => <Warehouse color={color} size={size} /> }} />
      <Tabs.Screen name="you" options={{ title: 'You', tabBarIcon: ({ color, size }) => <User color={color} size={size} /> }} />
      <Tabs.Screen name="analytics" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
