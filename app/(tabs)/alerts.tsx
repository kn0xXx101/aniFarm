import { View } from 'react-native';
import { AlertTriangle, Check } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { NeoScreen } from '@/components/neo3d/neo-screen';
import { TopBar } from '@/components/shell/top-bar';
import { SectionHeading } from '@/components/neo3d/section-heading';
import { EmptyState } from '@/components/layout/empty-state';
import { Card3D } from '@/components/ui/card-3d';
import { useAlertStore } from '@/lib/stores/alert-store';
import { COLORS, FONTS } from '@/lib/design-system';
import { UpgradeBanner } from '@/components/subscription/upgrade-banner';
import { usePlanGate } from '@/hooks/usePlanGate';

export default function AlertsTab() {
  const { gate, allowed } = usePlanGate('ai_alerts');
  const alerts = useAlertStore((s) => s.alerts);
  const markRead = useAlertStore((s) => s.markRead);
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <NeoScreen withTabs={false} padded={false}>
      <TopBar title="Alerts" showBack showAlerts={false} />

      <SectionHeading eyebrow="Notifications" title="Stay informed" description={`${unread} unread`} />

      <UpgradeBanner gate={gate} title="AI alerts require Pro" />

      {!allowed ? null : alerts.length === 0 ? (
        <EmptyState
          icon={<Check size={28} color={COLORS.primary} strokeWidth={2.5} />}
          title="All clear"
          description="No alerts right now."
        />
      ) : (
        alerts.map((a) => (
          <Card3D
            key={a.id}
            variant="glass"
            glowColor={a.severity === 'critical' ? COLORS.danger : COLORS.warning}
            className="mb-3"
            onPress={() => markRead(a.id)}
          >
            <View className="flex-row gap-3">
              <AlertTriangle size={20} color={a.severity === 'critical' ? COLORS.danger : COLORS.warning} />
              <View className="flex-1">
                <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink }}>{a.title}</Text>
                <Text className="text-sm mt-1" style={{ color: COLORS.inkMuted }}>
                  {a.message}
                </Text>
              </View>
              {!a.read ? <View className="size-2 rounded-full mt-2" style={{ backgroundColor: COLORS.primary }} /> : null}
            </View>
          </Card3D>
        ))
      )}
    </NeoScreen>
  );
}
