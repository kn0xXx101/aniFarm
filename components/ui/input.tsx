import React, { useCallback, useState } from 'react';
import { TextInput, View, type TextInputProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { SPRING_CONFIGS, TIMING_CONFIGS } from '@/lib/animations';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { cn } from '@/lib/utils';
import { Text } from './text';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, className, onFocus, onBlur, style, ...props }, ref) => {
    const [focused, setFocused] = useState(false);
    const shakeX = useSharedValue(0);

    const handleFocus = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onFocus']>>[0]) => {
        setFocused(true);
        onFocus?.(e);
      },
      [onFocus],
    );

    const handleBlur = useCallback(
      (e: Parameters<NonNullable<TextInputProps['onBlur']>>[0]) => {
        setFocused(false);
        onBlur?.(e);
      },
      [onBlur],
    );

    const shakeError = useCallback(() => {
      shakeX.value = withSequence(
        withTiming(-8, TIMING_CONFIGS.fast),
        withTiming(8, TIMING_CONFIGS.fast),
        withTiming(-4, TIMING_CONFIGS.fast),
        withTiming(4, TIMING_CONFIGS.fast),
        withTiming(0, TIMING_CONFIGS.fast),
      );
    }, [shakeX]);

    React.useEffect(() => {
      if (error) shakeError();
    }, [error, shakeError]);

    const shakeStyle = useAnimatedStyle(() => ({
      transform: [{ translateX: shakeX.value }],
    }));

    const accent = error ? COLORS.danger : focused ? COLORS.primary : COLORS.inkMuted;

    return (
      <Animated.View style={shakeStyle} className="w-full">
        {label ? (
          <Text style={{ fontFamily: FONTS.medium, color: COLORS.inkSecondary, fontSize: 14, marginBottom: 6 }}>
            {label}
          </Text>
        ) : null}
        <IosGlassSurface
          variant={focused ? 'accent' : 'glass'}
          radius={IOS_GLASS.radiusSm}
          padding={0}
          accentColor={accent}
          shadow="none"
        >
          <View
            className={cn('flex-row items-center px-3', className)}
            style={{ minHeight: 48 }}
          >
            {leftIcon ? <View style={{ marginRight: 8 }}>{leftIcon}</View> : null}
            <TextInput
              ref={ref}
              className="flex-1 py-3 text-base"
              style={[{ color: COLORS.ink, fontFamily: FONTS.regular }, style]}
              placeholderTextColor={COLORS.inkMuted}
              onFocus={handleFocus}
              onBlur={handleBlur}
              accessibilityLabel={label}
              {...props}
            />
            {rightIcon ? <View style={{ marginLeft: 8 }}>{rightIcon}</View> : null}
          </View>
        </IosGlassSurface>
        {error ? (
          <Text style={{ color: COLORS.danger, fontSize: 12, marginTop: 4 }}>{error}</Text>
        ) : null}
        {helperText && !error ? (
          <Text style={{ color: COLORS.inkMuted, fontSize: 12, marginTop: 4 }}>{helperText}</Text>
        ) : null}
      </Animated.View>
    );
  },
);

Input.displayName = 'Input';
