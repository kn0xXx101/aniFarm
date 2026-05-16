import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, Globe, Moon, Sun, LogOut, ShieldCheck, ChevronRight, Mail, Database } from 'lucide-react-native';

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
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <View className="items-center mb-6">
        <View className="size-20 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-3xl font-bold text-primary-foreground">
            {user?.name?.[0]?.toUpperCase() ?? 'P'}
          </Text>
        </View>
        <Text className="text-xl font-bold">{user?.name}</Text>
        <Text variant="muted" size="sm">{user?.email}</Text>
        <Badge variant="secondary" className="mt-2">
          <Text size="xs" className="capitalize">
            {user?.tier} plan
          </Text>
        </Badge>
      </View>

      <Card className="mb-3">
        <CardContent className="p-0">
          <Pressable
            onPress={() => router.push('/subscription')}
            className="flex-row items-center justify-between p-4 min-h-[56px]"
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-primary/10 items-center justify-center">
                <ShieldCheck size={18} color="hsl(142 72% 29%)" />
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

      <Card className="mb-3">
        <CardContent className="p-0">
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Bell size={18} color="hsl(142 72% 29%)" />
              </View>
              <Text className="font-semibold">Push notifications</Text>
            </View>
            <Switch checked={settings.pushEnabled} onCheckedChange={() => settings.toggle('pushEnabled')} />
          </View>
          <View className="flex-row items-center justify-between p-4 min-h-[56px] border-b border-border">
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-muted items-center justify-center">
                <Mail size={18} color="hsl(142 72% 29%)" />
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

      <Card className="mb-3">
        <CardContent className="p-0">
          <Pressable
            className="flex-row items-center justify-between p-4 min-h-[56px]"
            onPress={() => router.push('/admin')}
          >
            <View className="flex-row items-center gap-3">
              <View className="size-9 rounded-lg bg-primary/10 items-center justify-center">
                <ShieldCheck size={18} color="hsl(142 72% 29%)" />
              </View>
              <Text className="font-semibold">Admin dashboard</Text>
            </View>
            <ChevronRight size={18} color="hsl(150 10% 50%)" />
          </Pressable>
        </CardContent>
      </Card>

      <Button
        variant="outline"
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
