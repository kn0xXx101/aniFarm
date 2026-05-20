import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Text } from '@/components/ui/text';
import { MetricTile } from '@/components/ui/metric-tile';
import { LineAreaChart } from '@/components/line-area-chart';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { Button } from '@/components/ui/button';
import { Card3D } from '@/components/ui/card-3d';
import { useFarmStore } from '@/lib/stores/farm-store';
import { buildAnalytics } from '@/lib/mock-data';
import { COLORS, FONTS } from '@/lib/design-system';

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

  return (
    <NeoScreen>
      <TopBar title="Insights" showBack showAlerts={false} />

      <SectionHeading
        eyebrow="Analytics"
        title="Performance overview"
        description={`${farms.length} farms · combined metrics`}
      />

      <View className="flex-row gap-2 mb-4">
        {(['7d', '30d', '90d'] as Range[]).map((r) => (
          <Pressable
            key={r}
            onPress={() => setRange(r)}
            className="flex-1 py-2.5 rounded-xl items-center min-h-[44px] justify-center"
            style={{
              backgroundColor: range === r ? COLORS.primaryLight : COLORS.surfaceMuted,
              borderWidth: 1,
              borderColor: range === r ? COLORS.primary : COLORS.borderSoft,
            }}
          >
            <Text style={{ fontFamily: FONTS.semibold, color: range === r ? COLORS.primary : COLORS.inkMuted }}>{r}</Text>
          </Pressable>
        ))}
      </View>

      <View className="flex-row gap-2 mb-4">
        {(['count', 'mortality'] as const).map((m) => (
          <Pressable
            key={m}
            onPress={() => setMetric(m)}
            className="flex-1 py-2 rounded-xl items-center"
            style={{
              backgroundColor: metric === m ? COLORS.secondaryLight : COLORS.surfaceMuted,
              borderWidth: 1,
              borderColor: metric === m ? COLORS.secondary : COLORS.borderSoft,
            }}
          >
            <Text style={{ fontFamily: FONTS.semibold, color: metric === m ? COLORS.secondary : COLORS.inkMuted, textTransform: 'capitalize' }}>
              {m}
            </Text>
          </Pressable>
        ))}
      </View>

      <Card3D variant="glass" className="mb-4">
        <LineAreaChart data={series} metric={metric} stroke={COLORS.primary} height={180} />
        <Text className="text-sm mt-3" style={{ color: COLORS.inkMuted }}>
          Daily average:{' '}
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary }}>{avg.toLocaleString()}</Text>
        </Text>
      </Card3D>

      <MetricTile label="Period total" value={total.toLocaleString()} tone="success" />

      <Button className="rounded-xl mt-6" onPress={() => router.push('/reports')}>
        Export reports
      </Button>
    </NeoScreen>
  );
}
