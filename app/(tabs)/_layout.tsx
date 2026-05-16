import { Tabs } from 'expo-router';
import { Home, Camera, BarChart3 } from 'lucide-react-native';
import { Platform, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { NEON, SUNRISE_GRADIENT } from '@/lib/constants';

/**
 * Minimal 3-action floating bottom bar with a neon glass look.
 * Center action: oversized gradient FAB with cyan/green glow.
 */
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: NEON.green,
        tabBarInactiveTintColor: 'rgba(225,235,245,0.45)',
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 11,
          marginTop: 2,
          letterSpacing: 0.4,
        },
        tabBarStyle: {
          position: 'absolute',
          left: 18,
          right: 18,
          bottom: Platform.OS === 'ios' ? 24 : 16,
          height: 70,
          paddingTop: 10,
          paddingBottom: 10,
          borderRadius: 24,
          borderTopWidth: 0,
          borderWidth: 1,
          borderColor: 'rgba(0,255,163,0.18)',
          backgroundColor: 'rgba(8,12,24,0.85)',
          // neon glow
          shadowColor: NEON.green,
          shadowOpacity: 0.5,
          shadowRadius: 24,
          shadowOffset: { width: 0, height: 0 },
          elevation: 14,
        },
        tabBarBackground:
          Platform.OS === 'ios'
            ? () => (
                <BlurView
                  intensity={60}
                  tint="dark"
                  style={{ flex: 1, borderRadius: 24, overflow: 'hidden' }}
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
          title: 'Scan',
          tabBarIcon: ({ focused }) => (
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                marginTop: -22,
                overflow: 'hidden',
                shadowColor: NEON.green,
                shadowOpacity: 0.9,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: 0 },
                elevation: 12,
                borderWidth: focused ? 2 : 1,
                borderColor: focused ? NEON.cyan : 'rgba(0,255,163,0.6)',
              }}
            >
              <LinearGradient
                colors={[...SUNRISE_GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
              >
                <Camera color="#04060B" size={26} strokeWidth={2.6} />
              </LinearGradient>
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
      <Tabs.Screen name="farms" options={{ href: null }} />
      <Tabs.Screen name="alerts" options={{ href: null }} />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
