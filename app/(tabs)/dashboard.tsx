import { useMemo } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
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
  ArrowUpRight,
  Sparkles,
} from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import { LineAreaChart } from '@/components/line-area-chart';
import { AppHeader } from '@/components/app-header';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useOnlineStatus, useAutoSync } from '@/lib/sync';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { buildAnalytics } from '@/lib/mock-data';
import { SUNRISE_GRADIENT, SKY_GRADIENT } from '@/lib/constants';

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

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        {/* Gradient hero */}
        <View className="overflow-hidden">
          <LinearGradient
            colors={[...SUNRISE_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ paddingBottom: 56 }}
          >
            <AppHeader onGradient />

            <View className="px-5 pt-2">
              <Text className="text-white/85 text-sm font-medium">{greeting},</Text>
              <Text className="text-white text-3xl font-bold mt-0.5" numberOfLines={1}>
                {user?.name ?? 'Farmer'}
              </Text>
              <View className="flex-row items-center gap-2 mt-2">
                <View className="flex-row items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                  <Sparkles size={12} color="white" />
                  <Text className="text-white text-xs font-semibold">AI ready</Text>
                </View>
                {!online ? (
                  <View className="flex-row items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                    <CloudOff size={12} color="white" />
                    <Text className="text-white text-xs font-semibold">Offline</Text>
                  </View>
                ) : null}
                {pendingSync > 0 ? (
                  <View className="flex-row items-center gap-1.5 bg-white/20 rounded-full px-3 py-1">
                    <Text className="text-white text-xs font-semibold">
                      {pendingSync} pending
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Floating hero stat card — overlaps gradient */}
        <View className="px-5 -mt-12">
          <View className="rounded-3xl bg-card border border-border p-5 shadow-md" style={{
            shadowColor: '#000',
            shadowOpacity: 0.08,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 8 },
            elevation: 4,
          }}>
            <View className="flex-row items-center justify-between">
              <View>
                <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold">
                  Total flock
                </Text>
                <Text className="text-4xl font-extrabold mt-1 text-primary">
                  {totalBirds.toLocaleString()}
                </Text>
                <Text variant="muted" size="xs" className="mt-0.5">
                  Across {farms.length} farm{farms.length === 1 ? '' : 's'} · {houses.length} house{houses.length === 1 ? '' : 's'}
                </Text>
              </View>
              <View className="size-16 rounded-2xl bg-secondary items-center justify-center">
                <Bird size={28} color="hsl(18 95% 58%)" />
              </View>
            </View>

            <View className="h-px bg-border my-4" />

            <View className="flex-row justify-between">
              <View className="flex-1">
                <View className="flex-row items-center gap-1">
                  <ArrowUpRight size={14} color={trendPct >= 0 ? 'hsl(18 95% 58%)' : 'hsl(348 90% 56%)'} />
                  <Text className={`text-sm font-bold ${trendPct >= 0 ? 'text-primary' : 'text-destructive'}`}>
                    {trendPct >= 0 ? '+' : ''}{trendPct.toFixed(1)}%
                  </Text>
                </View>
                <Text variant="muted" size="xs">vs yesterday</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold">{todayCount.toLocaleString()}</Text>
                <Text variant="muted" size="xs">today</Text>
              </View>
              <View className="flex-1">
                <Text className="text-sm font-bold text-amber-500">{totalMortality}</Text>
                <Text variant="muted" size="xs">mortality 7d</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick count actions — gradient pills */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-lg">Quick count</Text>
            <Pressable
              onPress={() => router.push('/(tabs)/count')}
              className="min-h-[44px] px-2 justify-center"
            >
              <Text className="text-primary font-semibold text-sm">See all</Text>
            </Pressable>
          </View>

          <View className="flex-row gap-3">
            {([
              { icon: Camera, label: 'Live', sub: 'AI camera', path: '/count/live' as const, gradient: SUNRISE_GRADIENT },
              { icon: ImageIcon, label: 'Image', sub: 'Upload photo', path: '/count/image' as const, gradient: SKY_GRADIENT },
              { icon: Video, label: 'Video', sub: 'Frame-by-frame', path: '/count/video' as const, gradient: ['#FF5E62', '#FF9966'] as const },
            ]).map((q) => {
              const Icon = q.icon;
              return (
                <Pressable
                  key={q.label}
                  onPress={() => router.push(q.path)}
                  className="flex-1 rounded-3xl overflow-hidden min-h-[120px]"
                  accessibilityRole="button"
                  accessibilityLabel={`${q.label} counting`}
                >
                  <LinearGradient
                    colors={[...q.gradient]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ flex: 1, padding: 14, justifyContent: 'space-between' }}
                  >
                    <View className="size-10 rounded-2xl bg-white/25 items-center justify-center">
                      <Icon size={20} color="white" />
                    </View>
                    <View>
                      <Text className="text-white font-bold text-base">{q.label}</Text>
                      <Text className="text-white/85 text-xs mt-0.5">{q.sub}</Text>
                    </View>
                  </LinearGradient>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Secondary stat row */}
        <View className="flex-row flex-wrap gap-3 px-5 mt-5">
          <StatCard
            label="Sessions"
            value={String(sessions.length)}
            hint={`${pendingSync} pending sync`}
            icon={<Activity size={18} color="hsl(18 95% 58%)" />}
          />
          <StatCard
            label="Alerts"
            value={String(unreadAlerts)}
            hint="unread"
            icon={<AlertTriangle size={18} color="hsl(38 92% 50%)" />}
            tone="warning"
          />
        </View>

        {/* Chart */}
        <Card className="mx-5 mt-5 rounded-3xl">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text className="font-bold text-base">Flock trend</Text>
                <Text variant="muted" size="xs">
                  Last 30 days
                </Text>
              </View>
              <Pressable
                onPress={() => router.push('/(tabs)/analytics')}
                className="flex-row items-center gap-1 min-h-[44px] px-2"
              >
                <Text className="text-primary font-semibold text-sm">Details</Text>
                <ArrowUpRight size={14} color="hsl(18 95% 58%)" />
              </Pressable>
            </View>
            <LineAreaChart data={series} height={160} />
          </CardContent>
        </Card>

        {/* Farms list */}
        <View className="px-5 mt-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-bold text-lg">Your farms</Text>
            <Pressable
              onPress={() => router.push('/farm/new')}
              className="flex-row items-center gap-1 min-h-[44px] px-2 bg-secondary rounded-full"
            >
              <Plus size={14} color="hsl(18 95% 58%)" />
              <Text className="text-primary font-semibold text-sm pr-1">Add</Text>
            </Pressable>
          </View>
          {farms.slice(0, 3).map((f, idx) => {
            const fh = houses.filter((h) => h.farmId === f.id);
            const count = fh.reduce((s, h) => s + h.currentCount, 0);
            const cap = fh.reduce((s, h) => s + h.capacity, 0);
            const pct = cap ? Math.round((count / cap) * 100) : 0;
            const isFirst = idx === 0;
            return (
              <Pressable
                key={f.id}
                onPress={() => router.push({ pathname: '/farm/[id]', params: { id: f.id } })}
                className="rounded-3xl border border-border bg-card p-4 mb-3 min-h-[80px]"
              >
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={`size-12 rounded-2xl items-center justify-center ${isFirst ? '' : 'bg-secondary'}`}
                      style={isFirst ? { backgroundColor: '#FFE0CC' } : undefined}
                    >
                      <Bird size={20} color="hsl(18 95% 58%)" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-base" numberOfLines={1}>{f.name}</Text>
                      <Text variant="muted" size="xs" className="mt-0.5" numberOfLines={1}>
                        {f.location} · {fh.length} house{fh.length === 1 ? '' : 's'}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="font-bold text-base text-primary">{count.toLocaleString()}</Text>
                    <Text variant="muted" size="xs">
                      {pct}%
                    </Text>
                  </View>
                </View>
                <View className="h-2 bg-muted rounded-full mt-3 overflow-hidden">
                  <LinearGradient
                    colors={[...SUNRISE_GRADIENT]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ height: '100%', width: `${pct}%`, borderRadius: 999 }}
                  />
                </View>
              </Pressable>
            );
          })}

          {farms.length === 0 ? (
            <Pressable
              onPress={() => router.push('/farm/new')}
              className="rounded-3xl border-2 border-dashed border-border bg-secondary/40 p-6 items-center justify-center"
            >
              <View className="size-12 rounded-2xl bg-primary/15 items-center justify-center mb-2">
                <Plus size={22} color="hsl(18 95% 58%)" />
              </View>
              <Text className="font-bold">Add your first farm</Text>
              <Text variant="muted" size="xs" className="mt-1 text-center">
                Tap to set up a poultry farm and start counting.
              </Text>
            </Pressable>
          ) : null}
        </View>

        {/* Recent alerts */}
        {unreadAlerts > 0 ? (
          <View className="px-5 mt-6">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="font-bold text-lg">Recent alerts</Text>
              <Pressable
                onPress={() => router.push('/(tabs)/alerts')}
                className="min-h-[44px] px-2 justify-center"
              >
                <Text className="text-primary font-semibold text-sm">View all</Text>
              </Pressable>
            </View>
            {alerts.filter((a) => !a.read).slice(0, 2).map((a) => (
              <View key={a.id} className="rounded-3xl border border-border bg-card p-4 mb-2 flex-row gap-3 items-center">
                <View
                  className={`size-11 rounded-2xl items-center justify-center ${
                    a.severity === 'critical' ? 'bg-destructive/10' : 'bg-amber-400/15'
                  }`}
                >
                  <AlertTriangle
                    size={20}
                    color={a.severity === 'critical' ? 'hsl(348 90% 56%)' : 'hsl(38 92% 50%)'}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-bold">{a.title}</Text>
                  <Text variant="muted" size="xs" numberOfLines={2} className="mt-0.5">
                    {a.message}
                  </Text>
                </View>
                <Badge variant="default" className="bg-primary">
                  <Text size="xs" className="text-primary-foreground font-semibold">New</Text>
                </Badge>
              </View>
            ))}
          </View>
        ) : null}

        {/* CTA */}
        <View className="px-5 mt-6">
          <Pressable
            onPress={() => router.push('/reports')}
            className="rounded-3xl overflow-hidden"
          >
            <LinearGradient
              colors={[...SKY_GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <View className="flex-row items-center gap-3 flex-1">
                <View className="size-11 rounded-2xl bg-white/25 items-center justify-center">
                  <TrendingUp size={20} color="white" />
                </View>
                <View>
                  <Text className="text-white font-bold text-base">Generate report</Text>
                  <Text className="text-white/85 text-xs">PDF, CSV, weekly summary</Text>
                </View>
              </View>
              <ArrowUpRight size={20} color="white" />
            </LinearGradient>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
