import { useMemo } from 'react';
import { View } from 'react-native';
import { Building2, Activity, Users, AlertTriangle } from 'lucide-react-native';

import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { MetricCube } from '@/components/neo3d/metric-cube';
import { StaggerIn } from '@/components/neo3d/stagger-in';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { LineAreaChart } from '@/components/line-area-chart';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { buildAnalyticsFromSessions } from '@/lib/analytics';
import { COLORS, TYPE, LAYOUT } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { useBreakpoint } from '@/hooks/useBreakpoint';

function FarmStatBox({
  label,
  value,
  valueColor = COLORS.ink,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <IosGlassSurface variant="glass" radius={IOS_GLASS.radiusSm} padding={10} shadow="none">
        <Text style={TYPE.caption}>{label}</Text>
        <Text style={[TYPE.label, { color: valueColor, marginTop: 4 }]} numberOfLines={1}>
          {value}
        </Text>
      </IosGlassSurface>
    </View>
  );
}

export default function AdminDashboard() {
  const farms = useFarmStore((s) => s.farms);
  const sessions = useSessionStore((s) => s.sessions);
  const alerts = useAlertStore((s) => s.alerts);
  const { width, isNarrow } = useBreakpoint();
  const series = useMemo(() => buildAnalyticsFromSessions(sessions, 30), [sessions]);

  const totalAlive = sessions.reduce((sum, s) => sum + (s.aliveCount ?? s.count), 0);
  const activeAlerts = alerts.filter((a) => !a.read).length;
  const metricMinW = (width - LAYOUT.screenPadding * 2 - 10) / 2;

  return (
    <NeoScreen scroll withTabs={false} padded contentStyle={{ paddingTop: 8 }}>
      <TopBar title="Admin" showBack backTo="/(tabs)/profile" showAlerts={false} />
      <StaggerIn index={0}>
        <SectionHeading
          eyebrow="Operator"
          title="Admin overview"
          description="Farms, sessions, livestock totals, and alert volume across the platform."
        />
      </StaggerIn>

      <StaggerIn index={1}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 }}>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={String(farms.length)}
              label="Farms"
              icon={<Building2 size={18} color={COLORS.primary} />}
              glowColor={COLORS.primary}
            />
          </View>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={String(sessions.length)}
              label="Sessions"
              icon={<Activity size={18} color={COLORS.secondary} />}
              glowColor={COLORS.secondary}
            />
          </View>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={totalAlive.toLocaleString()}
              label="Total alive"
              icon={<Users size={18} color={COLORS.primary} />}
              glowColor={COLORS.primary}
            />
          </View>
          <View style={{ width: metricMinW - 5, flexGrow: 1 }}>
            <MetricCube
              value={String(activeAlerts)}
              label="Active alerts"
              icon={<AlertTriangle size={18} color={COLORS.warning} />}
              glowColor={COLORS.warning}
            />
          </View>
        </View>
      </StaggerIn>

      <StaggerIn index={2}>
        <Card3D variant="glass" size="md" style={{ marginBottom: 20 }}>
          <Text style={TYPE.label}>Platform throughput</Text>
          <Text style={[TYPE.caption, { marginTop: 4, marginBottom: 12 }]}>
            Aggregated alive counts · last 30 days
          </Text>
          <LineAreaChart data={series} height={isNarrow ? 160 : 180} stroke={COLORS.primary} />
        </Card3D>
      </StaggerIn>

      <StaggerIn index={3}>
        <SectionHeading title="Farms" description={`${farms.length} registered`} />
      </StaggerIn>

      {farms.length === 0 ? (
        <Card3D variant="glass" size="md">
          <Text style={[TYPE.bodySecondary, { textAlign: 'center' }]}>No farms registered yet.</Text>
        </Card3D>
      ) : (
        farms.map((farm, i) => {
          const farmSessions = sessions.filter((s) => s.farmId === farm.id);
          const farmAlerts = alerts.filter((a) => a.farmId === farm.id && !a.read);
          const livestock = farm.livestockType ?? farm.flockType ?? '—';

          return (
            <StaggerIn key={farm.id} index={4 + i}>
              <Card3D variant="glass" size="md" style={{ marginBottom: 10 }}>
                <Text style={TYPE.label} numberOfLines={1}>
                  {farm.name}
                </Text>
                <Text style={[TYPE.caption, { marginTop: 2, marginBottom: 12 }]} numberOfLines={1}>
                  {farm.location} · {livestock}
                </Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <FarmStatBox label="Sessions" value={String(farmSessions.length)} />
                  <FarmStatBox label="Capacity" value={farm.capacity.toLocaleString()} />
                  <FarmStatBox
                    label="Alerts"
                    value={farmAlerts.length > 0 ? String(farmAlerts.length) : 'None'}
                    valueColor={farmAlerts.length > 0 ? COLORS.warning : COLORS.primary}
                  />
                </View>
              </Card3D>
            </StaggerIn>
          );
        })
      )}
    </NeoScreen>
  );
}
