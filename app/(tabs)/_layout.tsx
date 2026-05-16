import { Tabs } from 'expo-router';
import { Home, Camera, BarChart3 } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';

import { useColorScheme } from '@/hooks/useColorScheme';

/**
 * Minimal 3-action floating bottom bar.
 * Other destinations (Farms, Alerts, Reports, Profile, Subscription, Admin)
 * live in the side drawer mounted in app/_layout.tsx.
 *
 * Farms and Alerts tabs are kept as routes (href is reachable from the drawer)
 * but hidden from the tab bar via `href: null`.
 */
export default function TabLayout() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'hsl(18 95% 58%)',
        tabBarInactiveTintColor: isDark ? 'hsl(28 12% 65%)' : 'hsl(20 12% 45%)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: 2,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: Platform.OS === 'ios' ? 24 : 16,
          height: 68,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 28,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: isDark ? 'hsl(18 18% 20%)' : 'hsl(24 60% 90%)',
          backgroundColor: isDark ? 'rgba(28,18,12,0.92)' : 'rgba(255,255,255,0.92)',
          // soft shadow
          shadowColor: '#FF6A3D',
          shadowOpacity: isDark ? 0.25 : 0.18,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 10,
        },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => (
                <BlurView
                  intensity={40}
                  tint={isDark ? 'dark' : 'light'}
                  style={{ flex: 1, borderRadius: 28, overflow: 'hidden' }}
                />
              )
            : undefined,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Home color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      <Tabs.Screen
        name="count"
        options={{
          title: 'Count',
          tabBarIcon: ({ focused }) => (
            // Center action: oversized gradient pill
            <View
              style={{
                width: 52,
                height: 52,
                borderRadius: 26,
                marginTop: -18,
                backgroundColor: 'hsl(18 95% 58%)',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#FF6A3D',
                shadowOpacity: 0.45,
                shadowRadius: 14,
                shadowOffset: { width: 0, height: 6 },
                elevation: 8,
                borderWidth: focused ? 3 : 0,
                borderColor: isDark ? '#1c120c' : '#fff',
              }}
            >
              <Camera color="white" size={24} strokeWidth={2.2} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Insights',
          tabBarIcon: ({ color, focused }) => (
            <BarChart3 color={color} size={focused ? 24 : 22} strokeWidth={focused ? 2.4 : 2} />
          ),
        }}
      />
      {/* Hidden routes — still reachable via drawer */}
      <Tabs.Screen name="farms" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
