import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface NeoChipProps {
  label: string;
  active?: boolean;
  color?: string;
}

export function NeoChip({ label, active, color = COLORS.primary }: NeoChipProps) {
  return (
    <View
      style={{
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        maxWidth: '100%',
        backgroundColor: active ? `${color}22` : COLORS.surfaceMuted,
        borderWidth: 1,
        borderColor: active ? color : COLORS.borderSoft,
      }}
    >
      <Text
        numberOfLines={1}
        style={{ fontFamily: FONTS.semibold, fontSize: 11, color: active ? color : COLORS.inkMuted }}
      >
        {label}
      </Text>
    </View>
  );
}
