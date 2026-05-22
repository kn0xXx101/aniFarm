import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BarChart3, TrendingUp, Skull } from 'lucide-react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { SegmentSlider } from '@/components/ui/segment-slider';
import { CountPillButton } from '@/components/count/count-pill-button';
import { LineAreaChart } from '@/components/line-area-chart';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { buildAnalyticsFromSessions } from '@/lib/analytics';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useScreenInsets } from '@/hooks/useScreenInsets';

type Range = '7d' | '30d' | '90d';
type Metric = 'count' | 'mortality';

const RANGE_OPTIONS = [
  { value: '7d' as const, label: '7 days' },
  { value: '30d' as const, label: '30 days' },
  { value: '90d' as const, label: '90 days' },
];

const METRIC_OPTIONS = [
  { value: 'count' as const, label: 'Alive' },
  { value: 'mortality' as const, label: 'Mortality' },
];

function ChartStatRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <View style={styles.statRow}>
      <Text style={TYPE.bodySecondary}>{label}</Text>
      <Text style={{ fontFamily: FONTS.bold, fontSize: 17, lineHeight: 22, color: valueColor }}>{value}</Text>
    </View>
  );
}

export default function AnalyticsTab() {
  const router = useRouter();
  const { horizontal } = useScreenInsets(false);
  const farms = useFarmStore((s) => s.farms);
  const sessions = useSessionStore((s) => s.sessions);
  const [range, setRange] = useState<Range>('30d');
  const [metric, setMetric] = useState<Metric>('count');
  const { width, isNarrow } = useBreakpoint();

  const series = useMemo(() => {
    const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    return buildAnalyticsFromSessions(sessions, days);
  }, [range, sessions]);

  const total = series.reduce((s, p) => s + p[metric], 0);
  const avg = Math.round(total / Math.max(1, series.length));
  const peak = series.length ? Math.max(...series.map((p) => p[metric])) : 0;
  const chartStroke = metric === 'count' ? COLORS.primary : COLORS.danger;
  const metricMinW = (width - horizontal * 2 - 10) / 2;

  const rangeLabel =
    range === '7d' ? 'last 7 days' : range === '30d' ? 'last 30 days' : 'last 90 days';

  return (
    <NeoScreen withTabs={false} padded={false} contentStyle={{ paddingHorizontal: horizontal }}>
      <TopBar title="Insights" showBack showAlerts={false} />

      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Analytics"
          title="Performance overview"
          description={`${farms.length} farms · ${sessions.length} sessions in view`}
        />
      </StaggerIn>

      <StaggerIn index={1}>
        <View style={styles.block}>
          <Text style={[TYPE.caption, styles.blockLabel]}>Time range</Text>
          <SegmentSlider options={RANGE_OPTIONS} value={range} onChange={setRange} />
        </View>
      </StaggerIn>

      <StaggerIn index={2}>
        <View style={styles.block}>
          <Text style={[TYPE.caption, styles.blockLabel]}>Metric</Text>
          <SegmentSlider options={METRIC_OPTIONS} value={metric} onChange={setMetric} />
        </View>
      </StaggerIn>

      <StaggerIn index={3}>
        <Card3D variant="glass" size="md" glowColor={chartStroke} style={styles.chartCard}>
          <Text style={TYPE.label}>{metric === 'count' ? 'Alive counts' : 'Mortality flags'}</Text>
          <Text style={[TYPE.caption, { marginTop: 4 }]}>Daily totals · {rangeLabel}</Text>

          <View style={styles.chartWrap}>
            <LineAreaChart
              data={series}
              metric={metric}
              stroke={chartStroke}
              height={isNarrow ? 160 : 190}
            />
          </View>

          <View style={styles.chartStats}>
            <ChartStatRow label="Daily average" value={avg.toLocaleString()} valueColor={chartStroke} />
            <View style={styles.statDivider} />
            <ChartStatRow label="Period total" value={total.toLocaleString()} valueColor={chartStroke} />
          </View>
        </Card3D>
      </StaggerIn>

      <StaggerIn index={4}>
        <View style={styles.metricRow}>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={total.toLocaleString()}
              label="Period total"
              icon={
                metric === 'count' ? (
                  <TrendingUp size={18} color={COLORS.primary} />
                ) : (
                  <Skull size={18} color={COLORS.danger} />
                )
              }
              glowColor={chartStroke}
            />
          </View>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={peak.toLocaleString()}
              label="Peak day"
              icon={<BarChart3 size={18} color={COLORS.secondary} />}
              glowColor={COLORS.secondary}
            />
          </View>
        </View>
      </StaggerIn>

      <StaggerIn index={5}>
        <CountPillButton
          label="Export reports"
          variant="default"
          size="lg"
          onPress={() => router.push('/(tabs)/reports')}
          style={styles.exportBtn}
        />
      </StaggerIn>
    </NeoScreen>
  );
}

const styles = StyleSheet.create({
  block: {
    marginBottom: 16,
  },
  blockLabel: {
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  chartCard: {
    marginBottom: 16,
  },
  chartWrap: {
    marginTop: 12,
    marginBottom: 4,
  },
  chartStats: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: COLORS.borderSoft,
    gap: 10,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  statDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: COLORS.borderSoft,
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  exportBtn: {
    width: '100%',
    marginBottom: 8,
  },
});
