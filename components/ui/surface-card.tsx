import type { ReactNode } from 'react';
import { type ViewProps, type ViewStyle } from 'react-native';

import { IosGlassSurface, type IosGlassVariant } from '@/components/ui/ios-glass-surface';
import { COLORS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
interface SurfaceCardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'muted' | 'accent' | 'danger';
  padded?: boolean;
}

const variantMap: Record<NonNullable<SurfaceCardProps['variant']>, IosGlassVariant> = {
  default: 'glass',
  muted: 'glass',
  accent: 'accent',
  danger: 'accent',
};

const accentMap: Record<NonNullable<SurfaceCardProps['variant']>, string> = {
  default: COLORS.primary,
  muted: COLORS.secondary,
  accent: COLORS.primary,
  danger: COLORS.danger,
};

export function SurfaceCard({
  children,
  onPress,
  variant = 'default',
  padded = true,
  style,
  ...props
}: SurfaceCardProps) {
  return (
    <IosGlassSurface
      variant={variantMap[variant]}
      radius={IOS_GLASS.radiusMd}
      padding={padded ? 16 : 0}
      accentColor={accentMap[variant]}
      onPress={onPress}
      shadow="soft"
      style={style as ViewStyle}
      {...props}
    >
      {children}
    </IosGlassSurface>
  );
}

/** Hero-sized glass panel for section headers. */
export function SurfaceCardHero(props: Omit<SurfaceCardProps, 'variant'>) {
  return <SurfaceCard {...props} variant="accent" />;
}
