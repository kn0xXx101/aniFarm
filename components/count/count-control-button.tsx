import type { ReactNode } from 'react';
import { StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';

import { SlidingButton } from '@/components/ui/sliding-button';
import { COLORS, FONTS } from '@/lib/design-system';

interface CountControlButtonProps {
  onPress: () => void;
  size: number;
  children: ReactNode;
  variant?: 'primary' | 'pause' | 'side' | 'save';
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

export function CountControlButton({
  onPress,
  size,
  children,
  variant = 'side',
  disabled,
  accessibilityLabel,
  style,
}: CountControlButtonProps) {
  const tone =
    variant === 'primary' ? 'primary' : variant === 'pause' ? 'danger' : variant === 'save' ? 'secondary' : 'ghost';

  return (
    <SlidingButton
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      tone={tone}
      shape="circle"
      size="sm"
      bare
      style={[
        {
          width: size,
          height: size,
          opacity: disabled ? 0.35 : 1,
        },
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text
          style={[
            styles.glyph,
            size < 52 && { fontSize: 20 },
            variant === 'primary' && { color: COLORS.primary },
            variant === 'pause' && { color: COLORS.danger },
            variant === 'save' && { color: COLORS.secondary },
            variant === 'side' && styles.glyphMuted,
          ]}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </SlidingButton>
  );
}

const styles = StyleSheet.create({
  glyph: {
    fontSize: 24,
    color: COLORS.ink,
    fontFamily: FONTS.bold,
  },
  glyphMuted: {
    color: COLORS.canvas,
  },
});
