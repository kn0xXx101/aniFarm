import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface DetailRowProps {
  label: string;
  value: string;
  last?: boolean;
}

export function DetailRow({ label, value, last }: DetailRowProps) {
  return (
    <View style={{ marginBottom: last ? 0 : 14 }}>
      <Text style={{ color: COLORS.inkMuted, fontSize: 12, fontFamily: FONTS.semibold }}>{label}</Text>
      <Text style={{ fontFamily: FONTS.semibold, color: COLORS.ink, fontSize: 16, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
