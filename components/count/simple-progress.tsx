import { View } from 'react-native';

import { COLORS } from '@/lib/design-system';

interface SimpleProgressProps {
  value: number;
}

export function SimpleProgress({ value }: SimpleProgressProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={{ height: 12, borderRadius: 999, backgroundColor: COLORS.surfaceMuted, overflow: 'hidden', marginBottom: 16 }}>
      <View style={{ height: '100%', width: `${pct}%`, backgroundColor: COLORS.primary, borderRadius: 999 }} />
    </View>
  );
}
