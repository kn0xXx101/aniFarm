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
  const radius = size / 2;
  const bg =
    variant === 'primary'
      ? COLORS.primary
      : variant === 'pause'
        ? COLORS.danger
        : variant === 'save'
          ? 'rgba(123,168,196,0.22)'
          : 'rgba(255,255,255,0.10)';

  const borderColor =
    variant === 'save' ? COLORS.secondary : variant === 'side' ? 'rgba(255,255,255,0.14)' : 'transparent';

  return (
    <SlidingButton
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      borderRadius={radius}
      fillShape="circle"
      fillColor={
        variant === 'primary' ? COLORS.primary : variant === 'pause' ? COLORS.danger : COLORS.secondary
      }
      backgroundColor={bg}
      style={[
        {
          width: size,
          height: size,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: variant === 'side' || variant === 'save' ? 1 : 0,
          borderColor,
          opacity: disabled ? 0.35 : 1,
        },
        variant === 'primary' && styles.primaryGlow,
        variant === 'pause' && styles.pauseGlow,
        style,
      ]}
    >
      {typeof children === 'string' ? (
        <Text style={[styles.glyph, size < 52 && { fontSize: 20 }]}>{children}</Text>
      ) : (
        children
      )}
    </SlidingButton>
  );
}

const styles = StyleSheet.create({
  glyph: {
    fontSize: 24,
    color: '#fff',
    fontFamily: FONTS.bold,
  },
  primaryGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 8,
  },
  pauseGlow: {
    shadowColor: COLORS.danger,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 6,
  },
});
