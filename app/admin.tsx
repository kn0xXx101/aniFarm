import { View, ScrollView } from 'react-native';
import { Users, Building2, Activity, AlertTriangle, Smartphone, DollarSign } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card, CardContent } from '@/components/ui/card';
import { StatCard } from '@/components/stat-card';
import { LineAreaChart } from '@/components/line-area-chart';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { buildAnalyticsFromSessions } from '@/lib/analytics';

export default function AdminDashboard() {
  const farms = useFarmStore((s) => s.farms);
  const sessions = useSessionStore((s) => s.sessions);
  const alerts = useAlertStore((s) => s.alerts);
  const series = buildAnalyticsFromSessions(sessions, 30);

  const totalBirds = sessions.reduce((sum, s) => sum + s.count, 0);
  const activeAlerts = alerts.filter((a) => !a.read).length;

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ padding: 20, paddingBottom: 60 }}>
      <Text className="text-2xl font-bold text-foreground mb-1">Admin overview</Text>
      <Text variant="muted" size="sm" className="mb-5">
        Operator view — farms, sessions, devices &amp; alert volume.
      </Text>

      <View className="flex-row flex-wrap gap-3 mb-4">
        <StatCard label="Farms" value={String(farms.length)} icon={<Building2 size={16} color="#00FFA3" />} />
        <StatCard label="Sessions" value={String(sessions.length)} icon={<Activity size={16} color="#00FFA3" />} />
        <StatCard label="Total alive" value={totalBirds.toLocaleString()} icon={<Users size={16} color="#00FFA3" />} tone="success" />
        <StatCard label="Active alerts" value={String(activeAlerts)} icon={<AlertTriangle size={16} color="#FFD600" />} tone="warning" />
      </View>

      <Card className="mb-4">
        <CardContent className="p-4">
          <Text className="font-semibold text-base">Platform throughput</Text>
          <Text variant="muted" size="xs" className="mt-0.5 mb-3">
            Aggregated livestock counts · 30d
          </Text>
          <LineAreaChart data={series} height={180} stroke="#00FFA3" />
        </CardContent>
      </Card>

      {farms.length === 0 ? (
        <View className="rounded-2xl border border-border bg-card p-6 items-center">
          <Text variant="muted" className="text-center">No farms registered yet.</Text>
        </View>
      ) : (
        farms.map((farm) => {
          const farmSessions = sessions.filter((s) => s.farmId === farm.id);
          const farmAlerts = alerts.filter((a) => a.farmId === farm.id && !a.read);
          return (
            <View key={farm.id} className="rounded-2xl border border-border bg-card p-4 mb-2">
              <View className="flex-row items-center justify-between mb-2">
                <View>
                  <Text className="font-semibold text-base">{farm.name}</Text>
                  <Text variant="muted" size="xs">
                    {farm.location} · {farm.livestockType ?? farm.flockType}
                  </Text>
                </View>
              </View>
              <View className="flex-row gap-3">
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">Sessions</Text>
                  <Text className="font-semibold">{farmSessions.length}</Text>
                </View>
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">Capacity</Text>
                  <Text className="font-semibold">{farm.capacity.toLocaleString()}</Text>
                </View>
                <View className="flex-1 bg-muted rounded-lg px-3 py-1.5">
                  <Text variant="muted" size="xs">Alerts</Text>
                  <Text className={`font-semibold ${farmAlerts.length > 0 ? 'text-yellow-400' : 'text-primary'}`}>
                    {farmAlerts.length > 0 ? farmAlerts.length : 'None'}
                  </Text>
                </View>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}
