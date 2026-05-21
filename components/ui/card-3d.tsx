/**
 * Card with optional tilt — iOS 26 liquid glass surfaces.
 */

import React, { useCallback, type ReactNode } from 'react';
import { type ViewProps, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { IosGlassSurface, type IosGlassVariant } from '@/components/ui/ios-glass-surface';
import { SPRING_3D } from '@/lib/animations-3d';
import { GRADIENTS_3D } from '@/lib/constants-3d';
import { COLORS, LAYOUT } from '@/lib/design-system';

type CardVariant = 'glass' | 'neon' | 'solid' | 'gradient';
type CardSize = 'sm' | 'md' | 'lg';

const SIZE_PADDING: Record<CardSize, number> = { sm: 12, md: 16, lg: 20 };

const VARIANT_MAP: Record<CardVariant, IosGlassVariant> = {
  glass: 'glass',
  neon: 'accent',
  solid: 'solid',
  gradient: 'accent',
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

  const accent = variant === 'gradient' && gradientColors?.[0] ? gradientColors[0] : glowColor;

  const handlePress = useCallback(() => {
    onPress?.();
  }, [onPress]);

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
      if (onPress) {
        runOnJS(handlePress)();
      }
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
    shadowColor: accent,
    shadowOffset: { width: 0, height: 4 + translateZ.value / 3 },
    shadowOpacity: 0.12 + translateZ.value / 100,
    shadowRadius: 14 + translateZ.value,
    elevation: 4 + translateZ.value / 2,
  }));

  const content = (
    <Animated.View style={[animatedStyle, shadowStyle, style as ViewStyle]} {...props}>
      <IosGlassSurface
        variant={VARIANT_MAP[variant]}
        radius={LAYOUT.radiusLg}
        padding={SIZE_PADDING[size]}
        accentColor={accent}
        shadow={variant === 'neon' ? 'hero' : 'soft'}
        contentStyle={{ flex: 1 }}
      >
        {children}
      </IosGlassSurface>
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
