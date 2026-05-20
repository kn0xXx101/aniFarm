import type { ReactNode } from 'react';
import { Pressable, View, type ViewProps } from 'react-native';

import { SHADOW, COLORS } from '@/lib/design-system';
import { cn } from '@/lib/utils';

interface SurfaceCardProps extends ViewProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'muted' | 'accent' | 'danger';
  padded?: boolean;
}

const variantBg = {
  default: COLORS.surface,
  muted: COLORS.surfaceMuted,
  accent: COLORS.primaryLight,
  danger: COLORS.dangerLight,
};

const variantBorder = {
  default: COLORS.borderSoft,
  muted: COLORS.borderSoft,
  accent: COLORS.border,
  danger: COLORS.danger,
};

export function SurfaceCard({
  children,
  onPress,
  variant = 'default',
  padded = true,
  className,
  style,
  ...props
}: SurfaceCardProps) {
  const inner = (
    <View
      className={cn('rounded-2xl border overflow-hidden', padded && 'p-4', className)}
      style={[
        SHADOW.card,
        {
          backgroundColor: variantBg[variant],
          borderColor: variantBorder[variant],
        },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} accessibilityRole="button" className="active:opacity-92">
        {inner}
      </Pressable>
    );
  }

  return inner;
}
