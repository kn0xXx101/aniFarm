import { Tabs } from 'expo-router';
import { Home, Bird, Camera, BarChart3, Bell } from 'lucide-react-native';
import { View } from 'react-native';
import { useAlertStore } from '@/lib/stores/alert-store';
import { Text } from '@/components/ui/text';

export default function TabLayout() {
  const unread = useAlertStore((s) => s.alerts.filter((a) => !a.read).length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: 'hsl(142 72% 29%)',
        tabBarInactiveTintColor: 'hsl(150 10% 50%)',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: 'hsl(150 20% 88%)',
          height: 64,
          paddingTop: 6,
          paddingBottom: 8,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="farms"
        options={{
          title: 'Farms',
          tabBarIcon: ({ color, size }) => <Bird color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="count"
        options={{
          title: 'Count',
          tabBarIcon: ({ color, size }) => <Camera color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: 'Analytics',
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <View>
              <Bell color={color} size={size} />
              {unread > 0 ? (
                <View className="absolute -right-2 -top-1 bg-destructive rounded-full min-w-[16px] h-4 px-1 items-center justify-center">
                  <Text className="text-[10px] font-bold text-destructive-foreground">
                    {unread > 9 ? '9+' : unread}
                  </Text>
                </View>
              ) : null}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="index" options={{ href: null }} />
    </Tabs>
  );
}
