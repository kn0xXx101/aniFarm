import { View, type ViewStyle } from 'react-native';
import Svg, { Circle, Path, Ellipse } from 'react-native-svg';

import { Text } from '@/components/ui/text';
import { BRAND, COLORS, FONTS } from '@/lib/design-system';

type LogoSize = 'sm' | 'md' | 'lg' | 'xl';

const MARK_SIZE: Record<LogoSize, number> = { sm: 28, md: 36, lg: 48, xl: 64 };
const WORD_SIZE: Record<LogoSize, number> = { sm: 16, md: 20, lg: 26, xl: 32 };

interface AniFarmLogoProps {
  size?: LogoSize;
  showWordmark?: boolean;
  variant?: 'full' | 'mark';
  style?: ViewStyle;
}

/** Organic mark: barn silhouette + leaf + alive pulse dot */
function LogoMark({ size }: { size: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <Circle cx="32" cy="32" r="30" fill={COLORS.surfaceMuted} opacity={0.9} />
      <Circle cx="32" cy="32" r="30" stroke={COLORS.border} strokeWidth={1.5} fill="none" />
      <Path
        d="M18 38 L32 22 L46 38 V48 H18 Z"
        fill={COLORS.soil}
        opacity={0.85}
      />
      <Path d="M32 22 L32 14" stroke={COLORS.accent} strokeWidth={2.5} strokeLinecap="round" />
      <Ellipse cx="32" cy="12" rx="6" ry="4" fill={COLORS.primary} opacity={0.9} />
      <Path
        d="M22 38 H42 V44 C42 46 40 48 32 48 C24 48 22 46 22 44 Z"
        fill={COLORS.surfaceElevated}
      />
      <Circle cx="48" cy="20" r="5" fill={COLORS.primary} />
      <Circle cx="48" cy="20" r="7" stroke={COLORS.primary} strokeWidth={1} opacity={0.4} fill="none" />
    </Svg>
  );
}

export function AniFarmLogo({
  size = 'md',
  showWordmark = true,
  variant = 'full',
  style,
}: AniFarmLogoProps) {
  const mark = MARK_SIZE[size];
  const word = WORD_SIZE[size];

  if (variant === 'mark') {
    return (
      <View style={style}>
        <LogoMark size={mark} />
      </View>
    );
  }

  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: size === 'sm' ? 8 : 10 }, style]}>
      <LogoMark size={mark} />
      {showWordmark ? (
        <View>
          <Text
            style={{
              fontFamily: FONTS.display,
              fontSize: word,
              color: COLORS.ink,
              letterSpacing: -0.5,
            }}
          >
            {BRAND.name}
          </Text>
          {size === 'lg' || size === 'xl' ? (
            <Text style={{ fontFamily: FONTS.medium, fontSize: 11, color: COLORS.inkMuted, marginTop: -2 }}>
              {BRAND.tagline}
            </Text>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function BrandMarkCompact() {
  return <AniFarmLogo size="sm" showWordmark />;
}
