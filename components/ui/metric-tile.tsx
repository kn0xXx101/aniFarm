import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS, FONTS } from '@/lib/design-system';

interface MetricTileProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

const valueColor: Record<NonNullable<MetricTileProps['tone']>, string> = {
  default: COLORS.ink,
  success: COLORS.primary,
  warning: COLORS.warning,
  danger: COLORS.danger,
};

export function MetricTile({ label, value, hint, icon, tone = 'default', className }: MetricTileProps) {
  return (
    <SurfaceCard className={className} variant={tone === 'danger' ? 'danger' : 'default'} style={{ flex: 1, minWidth: 140 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.inkMuted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
          </Text>
          <Text style={{ fontFamily: FONTS.bold, color: valueColor[tone], fontSize: 24, marginTop: 4 }}>{value}</Text>
          {hint ? <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 2 }}>{hint}</Text> : null}
        </View>
        {icon ? <View>{icon}</View> : null}
      </View>
    </SurfaceCard>
  );
}
