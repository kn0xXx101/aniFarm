import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

interface MetricCubeProps {
  value: string;
  label: string;
  icon?: ReactNode;
  glowColor?: string;
}

export function MetricCube({ value, label, icon, glowColor = COLORS.primary }: MetricCubeProps) {
  return (
    <View style={{ flex: 1, minWidth: 0 }}>
      <Card3D variant="glass" size="sm" glowColor={glowColor} onPress={undefined} style={{ flex: 1 }}>
        <View style={{ alignItems: 'center', paddingVertical: 2 }}>
          {icon ? <View style={{ marginBottom: 6 }}>{icon}</View> : null}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.7}
            style={{ fontFamily: FONTS.extrabold, color: COLORS.ink, fontSize: 22 }}
          >
            {value}
          </Text>
          <Text
            numberOfLines={1}
            style={{
              color: COLORS.inkMuted,
              fontFamily: FONTS.medium,
              fontSize: 11,
              marginTop: 4,
              textAlign: 'center',
            }}
          >
            {label}
          </Text>
        </View>
      </Card3D>
    </View>
  );
}
