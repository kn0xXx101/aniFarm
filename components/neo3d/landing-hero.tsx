import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandMarkCompact } from '@/components/brand/ani-farm-logo';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

interface LandingHeroProps {
  badge?: string;
  title: string;
  highlight?: string;
  subtitle?: string;
  actions?: ReactNode;
  compact?: boolean;
}

export function LandingHero({ badge, title, highlight, subtitle, actions, compact }: LandingHeroProps) {
  return (
    <IosGlassSurface
      variant="elevated"
      radius={IOS_GLASS.radiusHero}
      padding={compact ? 18 : 22}
      accentColor={COLORS.primary}
      shadow="hero"
      style={{ marginBottom: 20 }}
    >
      {badge ? (
        <View
          style={{
            alignSelf: 'flex-start',
            paddingHorizontal: 12,
            paddingVertical: 5,
            borderRadius: IOS_GLASS.radiusPill,
            marginBottom: 10,
            backgroundColor: COLORS.primaryLight,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: IOS_GLASS.border,
          }}
        >
          <Text style={{ fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 12 }}>{badge}</Text>
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: FONTS.display,
          color: COLORS.ink,
          fontSize: compact ? 24 : 28,
          lineHeight: compact ? 30 : 34,
        }}
      >
        {title}
        {highlight ? <Text style={{ color: COLORS.primary }}> {highlight}</Text> : null}
      </Text>
      {subtitle ? (
        <Text style={{ color: COLORS.inkSecondary, fontSize: 15, marginTop: 8, lineHeight: 22, fontFamily: FONTS.regular }}>
          {subtitle}
        </Text>
      ) : null}
      {actions ? <View style={{ marginTop: 18 }}>{actions}</View> : null}
    </IosGlassSurface>
  );
}

export function BrandMark() {
  return <BrandMarkCompact />;
}
