import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Sparkles } from 'lucide-react-native';

import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { CountPillButton } from '@/components/count/count-pill-button';
import type { SubscriptionCheck } from '@/lib/subscription/service';
import { COLORS, TYPE } from '@/lib/design-system';

interface UpgradeBannerProps {
  gate: SubscriptionCheck;
  title?: string;
}

export function UpgradeBanner({ gate, title = 'Upgrade required' }: UpgradeBannerProps) {
  const router = useRouter();
  if (gate.ok) return null;

  return (
    <Card3D variant="neon" glowColor={COLORS.primary} style={styles.card}>
      <View style={styles.row}>
        <View style={styles.icon}>
          <Sparkles size={18} color={COLORS.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[TYPE.label, { color: COLORS.ink }]}>{title}</Text>
          <Text style={[TYPE.bodySecondary, { marginTop: 4 }]}>{gate.message}</Text>
        </View>
      </View>
      <CountPillButton
        label="View plans"
        variant="default"
        onPress={() => router.push('/(tabs)/subscription')}
        style={{ width: '100%', marginTop: 12 }}
      />
    </Card3D>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
