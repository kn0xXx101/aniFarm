import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Globe, Moon, Sun, LogOut, ShieldCheck, ChevronRight, Mail, Database, Sparkles } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useToast } from '@/components/ui/toast';
import { SUNRISE_GRADIENT, NEON } from '@/lib/constants';

export default function Profile() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const settings = useSettingsStore();
  const syncPending = useSessionStore((s) => s.syncPending);
  const pendingCount = useSessionStore((s) => s.sessions.filter((x) => x.syncStatus === 'pending').length);
  const toast = useToast();

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ paddingBottom: 60 }}>
      {/* Gradient hero */}
      <View className="overflow-hidden">
        <LinearGradient
          colors={[...SUNRISE_GRADIENT]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ paddingBottom: 56 }}
        >
          <SafeAreaView edges={['top']}>
            <View className="items-center px-6 pt-6">
              <View
                className="size-24 rounded-full items-center justify-center mb-3"
                style={{
                  backgroundColor: NEON.bgDeep,
                  borderWidth: 3,
                  borderColor: 'rgba(255,255,255,0.7)',
                  shadowColor: '#000',
                  shadowOpacity: 0.3,
                  shadowRadius: 12,
                }}
              >
                <Text className="text-4xl font-bold" style={{ color: NEON.green }}>
                  {user?.name?.[0]?.toUpperCase() ?? 'P'}
                </Text>
              </View>
              <Text className="text-2xl font-extrabold text-white">{user?.name}</Text>
              <Text className="text-white/80 text-sm mt-0.5">{user?.email}</Text>
              <View className="flex-row items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 mt-2">
                <Sparkles size={12} color="white" />
                <Text className="text-white text-xs font-semibold capitalize">{user?.tier} plan</Text>
              </View>
            </View>
          </SafeAreaView>
        </LinearGradient>
      </View>

      <View className="px-5 -mt-6 mb-6">
        <View className="rounded-3xl bg-card border border-primary/30 p-4 flex-row gap-3" style={{
          shadowColor: NEON.green,
          shadowOpacity: 0.2,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 0 },
          elevation: 4,
        }}>
          <Pressable
            onPress={() => router.push('/subscription')}
            className="flex-1 items-center py-2"
          >
            <Text className="text-2xl font-extrabold text-primary capitalize">{user?.tier}</Text>
            <Text variant="muted" size="xs">Current plan</Text>
          </Pressable>
          <View className="w-px bg-border" />
          <View className="flex-1 items-center py-2">
            <Text className="text-2xl font-extrabold">{pendingCount}</Text>
            <Text variant="muted" size="xs">Pending sync</Text>
          </View>
        </View>
      </View>

      <Card className="mb-3 mx-5">
        <CardContent className="p-0">
          <Pressable
            onPress={() => router.push('/subscription')}
            className="flex-row items-center justify-between p-4 min-h-[56px]"
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-primary/10 items-center justify-center">
                <ShieldCheck size={18} color="#00FFA3" />
              </View>
              <View>
                <Text className="font-semibold">Subscription</Text>
                <Text variant="muted" size="xs" className="capitalize">{user?.tier} plan</Text>
              </View>
            </View>
            <ChevronRight size={18} color="hsl(150 10% 50%)" />
          </Pressable>
        </CardContent>
      </Card>

      <Card className="mb-3 mx-5">
        <CardContent className="p-0">
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Bell size={18} color="#00FFA3" />
              </View>
              <Text className="font-semibold">Push notifications</Text>
            </View>
            <Switch checked={settings.pushEnabled} onCheckedChange={() => settings.toggle('pushEnabled')} />
          </View>
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Mail size={18} color="#00FFA3" />
              </View>
              <Text className="font-semibold">Email summary</Text>
            </View>
            <Switch checked={settings.emailEnabled} onCheckedChange={() => settings.toggle('emailEnabled')} />
          </View>
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                {isDarkColorScheme ? (
                  <Moon size={18} color="hsl(142 72% 29%)" />
                ) : (
                  <Sun size={18} color="hsl(142 72% 29%)" />
                )}
              </View>
              <Text className="font-semibold">Dark mode</Text>
            </View>
            <Switch checked={isDarkColorScheme} onCheckedChange={toggleColorScheme} />
          </View>
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Database size={18} color="hsl(142 72% 29%)" />
              </View>
              <View>
                <Text className="font-semibold">Auto-sync</Text>
                <Text variant="muted" size="xs">
                  {pendingCount} pending
                </Text>
              </View>
            </View>
            <Switch checked={settings.autoSync} onCheckedChange={() => settings.toggle('autoSync')} />
          </View>
          <Pressable
            className="flex-row items-center justify-between p-4 min-h-[56px]"
            onPress={async () => {
              const n = await syncPending();
              toast.toast({ title: 'Synced', description: `${n} session${n === 1 ? '' : 's'} uploaded`, variant: 'success' });
            }}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Globe size={18} color="hsl(142 72% 29%)" />
              </View>
              <Text className="font-semibold">Sync now</Text>
            </View>
            <ChevronRight size={18} color="hsl(150 10% 50%)" />
          </Pressable>
        </CardContent>
      </Card>

      <Card className="mb-3 mx-5">
        <CardContent className="p-0">
          <Pressable
            className="flex-row items-center justify-between p-4 min-h-[56px]"
            onPress={() => router.push('/admin')}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-primary/10 items-center justify-center">
                <ShieldCheck size={18} color="#00FFA3" />
              </View>
              <Text className="font-semibold">Admin dashboard</Text>
            </View>
            <ChevronRight size={18} color="hsl(150 10% 50%)" />
          </Pressable>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="mx-5"
        onPress={() => {
          signOut();
          router.replace('/(auth)/login');
        }}
      >
        <LogOut size={16} color="hsl(0 84% 56%)" />
        <Text className="ml-2 text-destructive font-semibold">Sign out</Text>
      </Button>
    </ScrollView>
  );
}
