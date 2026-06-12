import React, { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';

import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS, LAYOUT } from '@/lib/design-system';
import { SPRING_3D } from '@/lib/animations-3d';

interface Input3DProps extends TextInputProps {
  label: string;
  error?: string;
  leftIcon?: React.ReactNode;
}

export function Input3D({
  label,
  error,
  leftIcon,
  onFocus,
  onBlur,
  style,
  ...props
}: Input3DProps) {
  const [isFocused, setIsFocused] = useState(false);
  const focusValue = useSharedValue(0);

  const handleFocus = (e: any) => {
    setIsFocused(true);
    focusValue.value = withSpring(1, SPRING_3D.snappy);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    focusValue.value = withSpring(0, SPRING_3D.gentle);
    onBlur?.(e);
  };

  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isFocused ? 1.02 : 1, SPRING_3D.snappy) },
      ],
    };
  });

  const glowStyle = useAnimatedStyle(() => {
    return {
      shadowColor: interpolateColor(
        focusValue.value,
        [0, 1],
        [COLORS.border, COLORS.primary]
      ),
      shadowOpacity: withSpring(isFocused ? 0.4 : 0.1, SPRING_3D.gentle),
      shadowRadius: withSpring(isFocused ? 12 : 4, SPRING_3D.gentle),
    };
  });

  return (
    <View style={styles.outer}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[containerStyle, glowStyle]}>
        <Card3D
          variant="glass"
          size="sm"
          tiltEnabled={isFocused}
          tiltIntensity={3}
          style={[
            styles.card,
            isFocused && { borderColor: COLORS.primary, borderWidth: 1 },
          ]}
        >
          <View style={styles.inner}>
            {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
            <TextInput
              style={[styles.input, style]}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholderTextColor={COLORS.inkMuted}
              selectionColor={COLORS.primary}
              {...props}
            />
          </View>
        </Card3D>
      </Animated.View>
      {error ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontFamily: FONTS.semibold,
    color: COLORS.inkMuted,
    fontSize: 13,
    marginBottom: 6,
    marginLeft: 4,
  },
  card: {
    borderRadius: LAYOUT.radiusMd,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    paddingHorizontal: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontFamily: FONTS.medium,
    color: COLORS.ink,
    fontSize: 16,
  },
  error: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});
