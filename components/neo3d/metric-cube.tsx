import type { ReactNode } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS, TYPE } from '@/lib/design-system';

interface MetricCubeProps {
  value: string;
  label: string;
  icon?: ReactNode;
  glowColor?: string;
}

export function MetricCube({ value, label, icon, glowColor = COLORS.primary }: MetricCubeProps) {
  const narrow = useWindowDimensions().width < 380;
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Card3D variant="glass" size="sm" glowColor={glowColor} onPress={undefined} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', paddingVertical: 2 }}>
          {icon ? <View style={{ marginBottom: 6 }}>{icon}</View> : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: narrow ? 18 : 22 }}
          >
            {value}
          </Text>
          <Text numberOfLines={1} style={[TYPE.caption, { marginTop: 4, textAlign: 'center' }]}>
            {label}
          </Text>
        </View>
      </Card3D>
    </View>
  );
}
