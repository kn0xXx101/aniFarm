import { useMemo, useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Download, TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { LineAreaChart } from '@/components/line-area-chart';
import { StatCard } from '@/components/stat-card';
import { AppHeader } from '@/components/app-header';
import { useFarmStore } from '@/lib/stores/farm-store';
import { buildAnalytics } from '@/lib/mock-data';
import { SKY_GRADIENT } from '@/lib/constants';

type Range = '7d' | '30d' | '90d';

export default function AnalyticsTab() {
  const router = useRouter();
  const farms = useFarmStore((s) => s.farms);
  const [range, setRange] = useState<Range>('30d');
  const [metric, setMetric] = useState<'count' | 'mortality'>('count');

  const series = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return buildAnalytics(days);
  }, [range]);

  const total = series.reduce((s, p) => s + p[metric], 0);
  const avg = Math.round(total / Math.max(1, series.length));
  const first = series[0]?.[metric] ?? 0;
  const last = series[series.length - 1]?.[metric] ?? 0;
  const change = first ? ((last - first) / first) * 100 : 0;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <AppHeader title="Insights" subtitle="Trends & analytics" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 4, paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold text-foreground">Analytics</Text>
            <Text variant="muted" size="sm">
              {farms.length} farm{farms.length === 1 ? '' : 's'} · all houses combined
            </Text>
          </View>
          <Pressable
            onPress={() => router.push('/reports')}
            accessibilityLabel="Export report"
            className="rounded-2xl overflow-hidden"
          >
            <LinearGradient
              colors={[...SKY_GRADIENT]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
            >
              <Download size={20} color="white" />
            </LinearGradient>
          </Pressable>
        </View>

        <View className="flex-row gap-2 mb-4">
          {(['7d', '30d', '90d'] as Range[]).map((r) => (
            <Pressable
              key={r}
              onPress={() => setRange(r)}
              className={`px-4 py-2 rounded-full border min-h-[40px] justify-center ${
                range === r ? 'bg-primary border-primary' : 'border-border bg-card'
              }`}
            >
              <Text
                className={
                  range === r ? 'text-primary-foreground font-bold' : 'text-foreground font-semibold'
                }
              >
                {r}
              </Text>
            </Pressable>
          ))}
        </View>

        <View className="flex-row gap-2 mb-4">
          {(['count', 'mortality'] as const).map((m) => (
            <Pressable
              key={m}
              onPress={() => setMetric(m)}
              className={`flex-1 px-4 py-2 rounded-2xl min-h-[44px] justify-center ${
                metric === m ? 'bg-secondary' : 'bg-card border border-border'
              }`}
            >
              <Text className="text-center font-bold capitalize">{m}</Text>
            </Pressable>
          ))}
        </View>

        <Card className="rounded-3xl">
          <CardContent className="p-4">
            <View className="flex-row items-center justify-between mb-3">
              <View>
                <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold">
                  {metric === 'count' ? 'Avg birds counted' : 'Avg mortality'}
                </Text>
                <Text className="text-3xl font-extrabold mt-1">{avg.toLocaleString()}</Text>
              </View>
              <View
                className={`flex-row items-center gap-1 rounded-full px-3 py-1.5 ${
                  change >= 0 ? 'bg-primary/10' : 'bg-destructive/10'
                }`}
              >
                {change >= 0 ? (
                  <TrendingUp size={16} color="hsl(18 95% 58%)" />
                ) : (
                  <TrendingDown size={16} color="hsl(348 90% 56%)" />
                )}
                <Text className={`font-bold ${change >= 0 ? 'text-primary' : 'text-destructive'}`}>
                  {change >= 0 ? '+' : ''}
                  {change.toFixed(1)}%
                </Text>
              </View>
            </View>
            <LineAreaChart
              data={series}
              metric={metric}
              stroke={metric === 'count' ? 'hsl(18 95% 58%)' : 'hsl(348 90% 56%)'}
              height={200}
            />
          </CardContent>
        </Card>

        <View className="flex-row flex-wrap gap-3 mt-4">
          <StatCard label="Period total" value={total.toLocaleString()} hint={range.toUpperCase()} />
          <StatCard
            label="Best day"
            value={Math.max(...series.map((p) => p.count)).toLocaleString()}
          />
          <StatCard
            label="Mortality rate"
            value={`${(
              (series.reduce((s, p) => s + p.mortality, 0) /
                Math.max(1, series.reduce((s, p) => s + p.count, 0))) *
              100
            ).toFixed(2)}%`}
            icon={<AlertTriangle size={18} color="hsl(38 92% 50%)" />}
            tone="warning"
          />
          <StatCard label="Sessions" value="74" hint="last 30d" />
        </View>

        <Pressable
          onPress={() => router.push('/reports')}
          className="mt-6 rounded-3xl overflow-hidden"
        >
          <LinearGradient
            colors={[...SKY_GRADIENT]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, alignItems: 'center' }}
          >
            <Text className="text-white font-bold">Export PDF / CSV</Text>
          </LinearGradient>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
