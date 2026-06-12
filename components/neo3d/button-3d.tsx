import React from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';
import { SPRING_3D } from '@/lib/animations-3d';

type Button3DVariant = 'primary' | 'secondary' | 'ghost' | 'glass';

interface Button3DProps extends Omit<PressableProps, 'children'> {
  children: React.ReactNode;
  variant?: Button3DVariant;
  glowColor?: string;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  textClassName?: string;
}

export function Button3D({
  children,
  variant = 'primary',
  glowColor = COLORS.primary,
  loading = false,
  disabled = false,
  style,
  textClassName,
  onPressIn,
  onPressOut,
  ...props
}: Button3DProps) {
  const isDisabled = disabled || loading;
  const pressValue = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(pressValue.value, [0, 1], [1, 0.96]);
    const rotateX = interpolate(pressValue.value, [0, 1], [0, -4]); // Subtle tilt on press

    return {
      transform: [
        { perspective: 1000 },
        { scale },
        { rotateX: `${rotateX}deg` },
        { translateY: interpolate(pressValue.value, [0, 1], [0, 2]) },
      ],
    } as any;
  });

  const shadowStyle = useAnimatedStyle(() => {
    return {
      shadowColor: glowColor,
      shadowOffset: {
        width: 0,
        height: interpolate(pressValue.value, [0, 1], [8, 4]),
      },
      shadowOpacity: interpolate(pressValue.value, [0, 1], [0.3, 0.1]),
      shadowRadius: interpolate(pressValue.value, [0, 1], [12, 6]),
      elevation: interpolate(pressValue.value, [0, 1], [10, 5]),
    };
  });

  const handlePressIn = (event: any) => {
    pressValue.value = withSpring(1, SPRING_3D.snappy);
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    pressValue.value = withSpring(0, SPRING_3D.bouncy);
    onPressOut?.(event);
  };

  const label = typeof children === 'string' ? (
    <Text
      className={textClassName}
      style={{
        fontFamily: FONTS.bold,
        color: variant === 'primary' ? '#FFFFFF' : COLORS.ink,
        fontSize: 16,
        opacity: loading ? 0 : 1,
      }}
    >
      {children}
    </Text>
  ) : (
    children
  );

  return (
    <AnimatedPressable
      disabled={isDisabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[styles.container, style]}
      hapticFeedback="medium"
      {...props}
    >
      <Animated.View style={[styles.shell, animatedStyle, shadowStyle]}>
        <IosGlassSurface
          variant={variant === 'primary' ? 'accent' : 'glass'}
          accentColor={variant === 'primary' ? glowColor : undefined}
          radius={LAYOUT.radiusLg}
          padding={0}
          shadow="none"
          style={styles.surface}
          contentStyle={styles.inner}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={variant === 'primary' ? '#FFFFFF' : glowColor}
            />
          ) : (
            label
          )}
        </IosGlassSurface>
      </Animated.View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 56,
  },
  shell: {
    height: 56,
    borderRadius: LAYOUT.radiusLg,
  },
  surface: {
    height: 56,
  },
  inner: {
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
