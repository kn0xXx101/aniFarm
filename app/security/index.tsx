import { useRouter } from 'expo-router';
import { Shield } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { CountPillButton } from '@/components/count/count-pill-button';
import { useAlertStore } from '@/lib/stores/alert-store';
import { COLORS, FONTS } from '@/lib/design-system';

export default function SecurityScreen() {
  const router = useRouter();
  const allAlerts = useAlertStore((s) => s.alerts);
  const alerts = useMemo(
    () =>
      allAlerts.filter(
        (a) => a.kind === 'intrusion' || a.title.toLowerCase().includes('human'),
      ),
    [allAlerts],
  );

  return (
    <OperationsScreen title="Security" subtitle="Human detection · intrusion log" requireFarm={false}>
      {alerts.length === 0 ? (
        <EmptyState
          icon={<Shield size={28} color={COLORS.secondary} strokeWidth={2} />}
          title="All clear"
          description="CCTV AI excludes humans from animal counts and logs unauthorized presence separately."
          actionLabel="Open CCTV"
          onAction={() => router.push('/(tabs)/cctv')}
        />
      ) : (
        alerts.map((a) => (
          <Card3D key={a.id} variant="glass" glowColor={COLORS.danger} style={{ marginBottom: 10 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }}>{a.title}</Text>
            <Text style={{ color: COLORS.inkMuted, marginTop: 6, fontSize: 13, lineHeight: 18 }}>{a.message}</Text>
            <Text style={{ color: COLORS.inkSecondary, fontSize: 11, marginTop: 8 }}>
              {new Date(a.createdAt).toLocaleString()}
            </Text>
          </Card3D>
        ))
      )}

      <CountPillButton
        label="View all alerts"
        variant="outline"
        onPress={() => router.push('/(tabs)/alerts')}
        style={{ width: '100%', marginTop: 16 }}
      />
    </OperationsScreen>
  );
}
