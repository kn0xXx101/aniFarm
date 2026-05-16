import { View, ScrollView } from 'react-native';
import { Users, Building2, Activity, AlertTriangle, Smartphone, DollarSign } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/stat-card';
import { LineAreaChart } from '@/components/line-area-chart';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { buildAnalytics } from '@/lib/mock-data';

const MOCK_TENANTS = [
  { id: 't1', name: 'Greenfield Group', users: 42, farms: 18, tier: 'Pro', mrr: 1960, devices: 36 },
  { id: 't2', name: 'Sunrise Layers Co', users: 12, farms: 4, tier: 'Basic', mrr: 76, devices: 6 },
  { id: 't3', name: 'Savannah Holdings', users: 88, farms: 31, tier: 'Enterprise', mrr: 4400, devices: 64 },
  { id: 't4', name: 'Awo Farms', users: 6, farms: 2, tier: 'Free', mrr: 0, devices: 3 },
];

export default function AdminDashboard() {
  const farms = useFarmStore((s) => s.farms);
  const sessions = useSessionStore((s) => s.sessions);
  const alerts = useAlertStore((s) => s.alerts);
  const series = buildAnalytics(30);

  const mrr = MOCK_TENANTS.reduce((s, t) => s + t.mrr, 0);
  const devices = MOCK_TENANTS.reduce((s, t) => s + t.devices, 0);
  const users = MOCK_TENANTS.reduce((s, t) => s + t.users, 0);

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">Admin overview</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Operator view — tenants, devices, billing & alert volume.
      </Text>

      <View className="flex-row flex-wrap gap-3 mb-4">
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} hint={`${MOCK_TENANTS.length} tenants`} icon={<DollarSign size={16} color="hsl(18 95% 58%)" />} tone="success" />
        <StatCard label="Users" value={String(users)} icon={<Users size={16} color="hsl(18 95% 58%)" />} />
        <StatCard label="Farms" value={String(farms.length + 53)} icon={<Building2 size={16} color="hsl(18 95% 58%)" />} />
        <StatCard label="Devices online" value={String(devices)} icon={<Smartphone size={16} color="hsl(18 95% 58%)" />} />
        <StatCard label="AI sessions" value={String(sessions.length + 612)} icon={<Activity size={16} color="hsl(18 95% 58%)" />} />
        <StatCard label="Active alerts" value={String(alerts.filter((a) => !a.read).length)} icon={<AlertTriangle size={16} color="hsl(38 92% 50%)" />} tone="warning" />
      </View>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Text className="font-semibold text-base">Platform throughput</Text>
          <Text variant="muted" size="xs" className="mt-0.5 mb-3">
            Aggregated bird counts across all tenants · 30d
          </Text>
          <LineAreaChart data={series} height={180} stroke="hsl(18 95% 58%)" />
        </CardContent>
      </Card>

      <Text className="font-semibold text-base mb-3">Tenants</Text>
      {MOCK_TENANTS.map((t) => (
        <View key={t.id} className="rounded-2xl border border-border bg-card p-4 mb-2">
          <View className="flex-row items-center justify-between mb-2">
            <View>
              <Text className="font-semibold text-base">{t.name}</Text>
              <Text variant="muted" size="xs">
                {t.users} users · {t.farms} farms · {t.devices} devices
              </Text>
            </View>
            <Badge variant={t.tier === 'Enterprise' || t.tier === 'Pro' ? 'default' : 'secondary'} className={t.tier === 'Enterprise' || t.tier === 'Pro' ? 'bg-primary' : ''}>
              <Text size="xs" className={t.tier === 'Enterprise' || t.tier === 'Pro' ? 'text-primary-foreground' : ''}>
                {t.tier}
              </Text>
            </Badge>
          </View>
          <View className="flex-row gap-3">
            <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
              <Text variant="muted" size="xs">MRR</Text>
              <Text className="font-semibold">${t.mrr.toLocaleString()}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
              <Text variant="muted" size="xs">ARPU</Text>
              <Text className="font-semibold">${(t.mrr / Math.max(1, t.users)).toFixed(2)}</Text>
            </View>
            <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
              <Text variant="muted" size="xs">Status</Text>
              <Text className="font-semibold text-primary">Healthy</Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
