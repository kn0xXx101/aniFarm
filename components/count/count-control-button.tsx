/**
 * CountControlButton — iOS 26 glass circle button for the live count dock.
 */

import type { ReactNode } from 'react';
import { Platform, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { useSlideFill } from '@/components/ui/slide-fill-overlay';
import { COLORS, GRADIENTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { SPRING_CONFIGS } from '@/lib/animations';

export type ControlVariant = 'primary' | 'pause' | 'side' | 'save';

interface CountControlButtonProps {
  onPress: () => void;
  size: number;
  children: ReactNode;
  variant?: ControlVariant;
  disabled?: boolean;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

const ACCENT: Record<ControlVariant, string> = {
  primary: COLORS.primary,
  pause:   COLORS.danger,
  save:    COLORS.secondary,
  side:    COLORS.ink,
};

export function CountControlButton({
  onPress,
  size,
  children,
  variant = 'side',
  disabled,
  accessibilityLabel,
  style,
}: CountControlButtonProps) {
  const accent = ACCENT[variant];
  const radius = size / 2;
  const isFilled = variant === 'primary' || variant === 'pause';

  const press = useSharedValue(0);
  const shellAnim = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - press.value * 0.06 }],
  }));

  const { onPressIn: fillIn, onPressOut: fillOut, Fill, onLayout } = useSlideFill({
    disabled,
    fillColor: accent,
    shape: 'circle',
    borderRadius: radius,
  });

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled === true}
      hapticFeedback={isFilled ? 'medium' : 'light'}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPressIn={() => {
        if (!disabled) {
          press.value = withSpring(1, SPRING_CONFIGS.snappy);
          fillIn();
        }
      }}
      onPressOut={() => {
        press.value = withSpring(0, SPRING_CONFIGS.snappy);
        fillOut();
      }}
      style={[
        { opacity: disabled ? 0.38 : 1, alignItems: 'center', justifyContent: 'center' },
        style,
      ]}
    >
      <Animated.View
        onLayout={onLayout}
        style={[
          {
            width: size,
            height: size,
            borderRadius: radius,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
          },
          shellAnim,
          isFilled && {
            shadowColor: accent,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 14,
            elevation: 8,
          },
        ]}
      >
        {/* ── Background layer ── */}
        {variant === 'primary' ? (
          <LinearGradient
            colors={[...GRADIENTS.hero]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
        ) : variant === 'pause' ? (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: COLORS.danger },
            ]}
          />
        ) : variant === 'save' ? (
          // Cyan solid fill
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: COLORS.secondary },
            ]}
          />
        ) : (
          // Neutral elevated glass (reset)
          <>
            {Platform.OS !== 'web' ? (
              <BlurView
                intensity={IOS_GLASS.blurIntensityStrong}
                tint={IOS_GLASS.tint}
                style={StyleSheet.absoluteFill}
              />
            ) : (
              <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(26,37,32,0.88)' }]} />
            )}
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: IOS_GLASS.tintFillStrong },
              ]}
            />
          </>
        )}

        {/* ── Border ── */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius: radius,
              borderWidth: StyleSheet.hairlineWidth,
              borderColor:
                variant === 'primary' ? 'rgba(255,255,255,0.28)' :
                variant === 'pause'   ? 'rgba(255,255,255,0.22)' :
                variant === 'save'    ? `${COLORS.secondary}60` :
                IOS_GLASS.border,
            },
          ]}
        />

        {/* ── Top shimmer ── */}
        <LinearGradient
          colors={['rgba(255,255,255,0.14)', 'transparent']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius }]}
          pointerEvents="none"
        />

        {/* ── Slide fill on press ── */}
        <Fill />

        {/* ── Icon ── */}
        <View
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
          pointerEvents="none"
        >
          {children}
        </View>
      </Animated.View>
    </AnimatedPressable>
  );
}
