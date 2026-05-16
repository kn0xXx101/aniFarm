import { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bird,
  TrendingUp,
  AlertTriangle,
  Activity,
  Camera,
  Image as ImageIcon,
  Video,
  Plus,
  CloudOff,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import { LineAreaChart } from '@/components/line-area-chart';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useOnlineStatus, useAutoSync } from '@/lib/sync';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { buildAnalytics } from '@/lib/mock-data';

export default function Dashboard() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const farms = useFarmStore((s) => s.farms);
  const houses = useFarmStore((s) => s.houses);
  const sessions = useSessionStore((s) => s.sessions);
  const pendingSync = useSessionStore((s) => s.sessions.filter((x) => x.syncStatus === 'pending').length);
  const alerts = useAlertStore((s) => s.alerts);
  const online = useOnlineStatus();
  const autoSync = useSettingsStore((s) => s.autoSync);
  useAutoSync(autoSync);

  const series = useMemo(() => buildAnalytics(30), []);
  const totalBirds = houses.reduce((sum, h) => sum + h.currentCount, 0);
  const totalMortality = houses.reduce((sum, h) => sum + h.mortality7d, 0);
  const todayCount = series[series.length - 1]?.count ?? 0;
  const yesterdayCount = series[series.length - 2]?.count ?? todayCount;
  const trendPct = yesterdayCount ? ((todayCount - yesterdayCount) / yesterdayCount) * 100 : 0;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-5 pt-2 pb-4 flex-row items-center justify-between">
          <View>
            <Text variant="muted" size="sm">
              Good day,
            </Text>
            <Text className="text-2xl font-bold text-foreground">{user?.name ?? 'Farmer'}</Text>
          </View>
          <View className="flex-row items-center gap-2">
            {!online ? (
              <Badge variant="secondary" className="flex-row items-center gap-1">
                <CloudOff size={12} color="hsl(150 10% 40%)" />
                <Text size="xs" className="text-muted-foreground">
                  Offline
                </Text>
              </Badge>
            ) : null}
            <Pressable
              onPress={() => router.push('/profile')}
              className="size-11 rounded-full bg-primary items-center justify-center"
              accessibilityLabel="Profile"
            >
              <Text className="text-primary-foreground font-bold">
                {user?.name?.[0]?.toUpperCase() ?? 'P'}
              </Text>
            </Pressable>
          </View>
        </View>

        {pendingSync > 0 ? (
          <View className="mx-5 mb-3 flex-row items-center gap-2 rounded-xl border border-amber-400/40 bg-amber-400/10 p-3">
            <CloudOff size={16} color="hsl(38 92% 50%)" />
            <Text size="sm" className="flex-1">
              {pendingSync} session{pendingSync > 1 ? 's' : ''} pending sync
            </Text>
            <Text size="xs" variant="muted">
              {online ? 'syncing…' : 'will sync when online'}
            </Text>
          </View>
        ) : null}

        {/* Hero stats */}
        <View className="flex-row flex-wrap gap-3 px-5">
          <StatCard
            label="Total birds"
            value={totalBirds.toLocaleString()}
            hint={`Across ${farms.length} farm${farms.length === 1 ? '' : 's'}`}
            icon={<Bird size={18} color="hsl(142 72% 29%)" />}
            tone="success"
          />
          <StatCard
            label="Today vs yesterday"
            value={`${trendPct >= 0 ? '+' : ''}${trendPct.toFixed(1)}%`}
            hint={`${todayCount.toLocaleString()} counted today`}
            icon={<TrendingUp size={18} color="hsl(142 72% 29%)" />}
            tone={trendPct >= 0 ? 'success' : 'destructive'}
          />
          <StatCard
            label="Mortality 7d"
            value={String(totalMortality)}
            hint="Below threshold"
            icon={<AlertTriangle size={18} color="hsl(38 92% 50%)" />}
            tone="warning"
          />
          <StatCard
            label="Sessions"
            value={String(sessions.length)}
            hint={`${pendingSync} pending`}
            icon={<Activity size={18} color="hsl(142 72% 29%)" />}
          />
        </View>

        {/* Chart */}
        <Card className="mx-5 mt-5">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="font-semibold text-base">Flock trend</Text>
                <Text variant="muted" size="xs">
                  Last 30 days
                </Text>
              </View>
              <Pressable onPress={() => router.push('/(tabs)/analytics')} className="min-h-[44px] min-w-[44px] items-center justify-center">
                <Text className="text-primary font-semibold">Details</Text>
              </Pressable>
            </View>
            <LineAreaChart data={series} height={160} />
          </CardContent>
        </Card>

        {/* Quick actions */}
        <View className="px-5 mt-6">
          <Text className="font-semibold text-base mb-3">Quick count</Text>
          <View className="flex-row gap-3">
            {[
              { icon: Camera, label: 'Live', path: '/count/live' as const, tone: 'bg-primary' },
              { icon: ImageIcon, label: 'Image', path: '/count/image' as const, tone: 'bg-accent' },
              { icon: Video, label: 'Video', path: '/count/video' as const, tone: 'bg-secondary' },
            ].map((q) => {
              const Icon = q.icon;
              return (
                <Pressable
                  key={q.label}
                  onPress={() => router.push(q.path)}
                  className="flex-1 rounded-2xl border border-border bg-card p-4 items-center min-h-[100px] justify-center"
                  accessibilityRole="button"
                  accessibilityLabel={`${q.label} counting`}
                >
                  <View className={`size-12 rounded-full ${q.tone} items-center justify-center mb-2`}>
                    <Icon size={22} color={q.tone === 'bg-secondary' ? 'hsl(142 72% 29%)' : 'white'} />
                  </View>
                  <Text className="font-semibold">{q.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Farms list summary */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-semibold text-base">Your farms</Text>
            <Pressable onPress={() => router.push('/farm/new')} className="flex-row items-center gap-1 min-h-[44px] px-2">
              <Plus size={16} color="hsl(142 72% 29%)" />
              <Text className="text-primary font-semibold">Add</Text>
            </Pressable>
          </View>
          {farms.slice(0, 3).map((f) => {
            const fh = houses.filter((h) => h.farmId === f.id);
            const count = fh.reduce((s, h) => s + h.currentCount, 0);
            const cap = fh.reduce((s, h) => s + h.capacity, 0);
            const pct = cap ? Math.round((count / cap) * 100) : 0;
            return (
              <Pressable
                key={f.id}
                onPress={() => router.push({ pathname: '/farm/[id]', params: { id: f.id } })}
                className="rounded-2xl border border-border bg-card p-4 mb-3 min-h-[80px]"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-1">
                    <Text className="font-semibold text-base">{f.name}</Text>
                    <Text variant="muted" size="xs" className="mt-0.5">
                      {f.location} · {fh.length} house{fh.length === 1 ? '' : 's'}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-base text-primary">{count.toLocaleString()}</Text>
                    <Text variant="muted" size="xs">
                      {pct}% capacity
                    </Text>
                  </View>
                </View>
                <View className="h-1.5 bg-muted rounded-full mt-3 overflow-hidden">
                  <View className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Recent alerts */}
        {unreadAlerts > 0 ? (
          <View className="px-5 mt-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-semibold text-base">Recent alerts</Text>
              <Pressable onPress={() => router.push('/(tabs)/alerts')} className="min-h-[44px] px-2 justify-center">
                <Text className="text-primary font-semibold">View all</Text>
              </Pressable>
            </View>
            {alerts.filter((a) => !a.read).slice(0, 2).map((a) => (
              <View key={a.id} className="rounded-2xl border border-border bg-card p-4 mb-2 flex-row gap-3">
                <View className={`size-10 rounded-full items-center justify-center ${a.severity === 'critical' ? 'bg-destructive/10' : 'bg-amber-400/10'}`}>
                  <AlertTriangle size={18} color={a.severity === 'critical' ? 'hsl(0 84% 56%)' : 'hsl(38 92% 50%)'} />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold">{a.title}</Text>
                  <Text variant="muted" size="xs" numberOfLines={2} className="mt-0.5">
                    {a.message}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <View className="px-5 mt-6">
          <Button variant="outline" onPress={() => router.push('/reports')}>
            <Text className="font-semibold">Generate report</Text>
          </Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
