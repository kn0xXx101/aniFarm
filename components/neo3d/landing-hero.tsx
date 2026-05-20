import type { ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { BRAND, COLORS, FONTS, GRADIENTS, LAYOUT, SHADOW } from '@/lib/design-system';

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
    <LinearGradient
      colors={[...GRADIENTS.glass]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        {
          borderRadius: LAYOUT.radiusHero,
          padding: compact ? 18 : 22,
          marginBottom: 20,
          borderWidth: 1,
          borderColor: COLORS.border,
          overflow: 'hidden',
        },
        SHADOW.hero,
      ]}
    >
      <LinearGradient
        colors={['rgba(0,255,163,0.12)', 'transparent', 'rgba(168,85,247,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <View style={{ zIndex: 1 }}>
        {badge ? (
          <View
            style={{
              alignSelf: 'flex-start',
              paddingHorizontal: 12,
              paddingVertical: 4,
              borderRadius: 999,
              marginBottom: 10,
              backgroundColor: COLORS.primaryLight,
              borderWidth: 1,
              borderColor: COLORS.border,
            }}
          >
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.primary, fontSize: 12 }}>{badge}</Text>
          </View>
        ) : null}
        <Text
          style={{
            fontFamily: FONTS.extrabold,
            color: COLORS.ink,
            fontSize: compact ? 26 : 28,
            lineHeight: compact ? 32 : 34,
          }}
        >
          {title}
          {highlight ? <Text style={{ color: COLORS.primary }}> {highlight}</Text> : null}
        </Text>
        {subtitle ? (
          <Text style={{ color: COLORS.inkSecondary, fontSize: 15, marginTop: 8, lineHeight: 22 }}>{subtitle}</Text>
        ) : null}
        {actions ? <View style={{ marginTop: 18 }}>{actions}</View> : null}
      </View>
    </LinearGradient>
  );
}

export function BrandMark() {
  return (
    <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>
      {BRAND.name}
    </Text>
  );
}
