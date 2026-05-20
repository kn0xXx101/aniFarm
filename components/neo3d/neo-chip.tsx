import { StyleSheet, View } from 'react-native';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

interface NeoChipProps {
  label: string;
  active?: boolean;
  color?: string;
}

export function NeoChip({ label, active, color = COLORS.primary }: NeoChipProps) {
  if (active) {
    return (
      <IosGlassSurface
        variant="accent"
        radius={IOS_GLASS.radiusPill}
        padding={0}
        accentColor={color}
        shadow="none"
        style={{ maxWidth: '100%' }}
        contentStyle={{
          paddingHorizontal: 12,
          paddingVertical: 6,
        }}
      >
        <Text numberOfLines={1} style={{ fontFamily: FONTS.semibold, fontSize: 11, color }}>
          {label}
        </Text>
      </IosGlassSurface>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: IOS_GLASS.radiusPill,
        maxWidth: '100%',
        backgroundColor: IOS_GLASS.tintFill,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: IOS_GLASS.borderSoft,
      }}
    >
      <Text numberOfLines={1} style={{ fontFamily: FONTS.semibold, fontSize: 11, color: COLORS.inkMuted }}>
        {label}
      </Text>
    </View>
  );
}
