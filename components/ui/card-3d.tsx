/**
 * 3D card with optional tilt — uses explicit dark-theme styles for reliable RN display.
 */

import React, { type ReactNode } from 'react';
import { StyleSheet, View, type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { LinearGradient } from 'expo-linear-gradient';

import { SPRING_3D } from '@/lib/animations-3d';
import { GRADIENTS_3D } from '@/lib/constants-3d';
import { COLORS, LAYOUT } from '@/lib/design-system';

type CardVariant = 'glass' | 'neon' | 'solid' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg';

const SIZE_PADDING: Record<CardSize, number> = { sm: 12, md: 16, lg: 20 };

const VARIANT_STYLE: Record<CardVariant, ViewStyle> = {
  glass: {
    backgroundColor: COLORS.surfaceGlass,
    borderColor: COLORS.borderSoft,
  },
  neon: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
  },
  solid: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.borderSoft,
  },
  gradient: {
    backgroundColor: COLORS.surfaceMuted,
    borderColor: COLORS.border,
  },
};

interface Card3DProps extends ViewProps {
  children: ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  tiltEnabled?: boolean;
  tiltIntensity?: number;
  glowColor?: string;
  gradientColors?: readonly [string, string, ...string[]];
  onPress?: () => void;
  className?: string;
  /** @deprecated Use style — className kept for NativeWind compat */
}

export function Card3D({
  children,
  variant = 'glass',
  size = 'md',
  tiltEnabled = false,
  tiltIntensity = 8,
  glowColor = COLORS.primary,
  gradientColors,
  onPress,
  style,
  ...props
}: Card3DProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const translateZ = useSharedValue(0);

  const gesture = Gesture.Pan()
    .enabled(tiltEnabled)
    .activeOffsetX([-12, 12])
    .failOffsetY([-8, 8])
    .onBegin(() => {
      scale.value = withSpring(1.02, SPRING_3D.snappy);
    })
    .onUpdate((event) => {
      const maxTilt = tiltIntensity;
      rotateY.value = interpolate(event.translationX, [-120, 120], [-maxTilt, maxTilt], Extrapolate.CLAMP);
      rotateX.value = interpolate(event.translationY, [-120, 120], [maxTilt, -maxTilt], Extrapolate.CLAMP);
      translateZ.value = 12;
    })
    .onEnd(() => {
      rotateX.value = withSpring(0, SPRING_3D.gentle);
      rotateY.value = withSpring(0, SPRING_3D.gentle);
      scale.value = withSpring(1, SPRING_3D.gentle);
      translateZ.value = withSpring(0, SPRING_3D.gentle);
    });

  const tapGesture = Gesture.Tap()
    .enabled(!!onPress)
    .onBegin(() => {
      scale.value = withSpring(0.98, SPRING_3D.snappy);
    })
    .onEnd(() => {
      scale.value = withSpring(1, SPRING_3D.bouncy);
      onPress?.();
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: tiltEnabled
      ? [
          { rotateX: `${rotateX.value}deg` },
          { rotateY: `${rotateY.value}deg` },
          { scale: scale.value },
        ]
      : [{ scale: scale.value }],
  }));

  const shadowStyle = useAnimatedStyle(() => ({
    shadowColor: glowColor,
    shadowOffset: { width: 0, height: 4 + translateZ.value / 3 },
    shadowOpacity: 0.15 + translateZ.value / 80,
    shadowRadius: 12 + translateZ.value,
    elevation: 4 + translateZ.value / 2,
  }));

  const cardStyle: ViewStyle = {
    borderRadius: LAYOUT.radiusLg,
    borderWidth: 1,
    padding: SIZE_PADDING[size],
    overflow: 'hidden',
    ...VARIANT_STYLE[variant],
  };

  const content = (
    <Animated.View style={[animatedStyle, shadowStyle, cardStyle, style]} {...props}>
      {variant === 'gradient' && gradientColors ? (
        <LinearGradient
          colors={gradientColors as [string, string, ...string[]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      ) : null}
      <View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: glowColor, opacity: 0.04, borderRadius: LAYOUT.radiusLg }]}
      />
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: LAYOUT.radiusLg }]}
        pointerEvents="none"
      />
      <View style={{ zIndex: 1 }}>{children}</View>
    </Animated.View>
  );

  if (onPress || tiltEnabled) {
    return <GestureDetector gesture={Gesture.Race(gesture, tapGesture)}>{content}</GestureDetector>;
  }

  return content;
}

export function GlassCard3D(props: Omit<Card3DProps, 'variant'>) {
  return <Card3D variant="glass" {...props} />;
}

export function NeonCard3D(props: Omit<Card3DProps, 'variant'>) {
  return <Card3D variant="neon" glowColor={COLORS.primary} {...props} />;
}

export function GradientCard3D(props: Omit<Card3DProps, 'variant'>) {
  return <Card3D variant="gradient" gradientColors={[...GRADIENTS_3D.aurora]} {...props} />;
}
