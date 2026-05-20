import React, { useCallback, useState, type ReactNode } from 'react';
import { LayoutChangeEvent, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { AnimatedPressable } from '@/components/ui/primitives/animated-pressable';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import {
  getSliderLabelColor,
  getSliderThumbColors,
  iosSliderStyles,
  IOS_SLIDER,
  type SliderAccent,
} from '@/lib/ios-slider-style';
import { SPRING_CONFIGS } from '@/lib/animations';
import { useSettingsStore } from '@/lib/stores/settings-store';

export type SlidingButtonTone = SliderAccent | 'ghost';

export interface SlidingButtonProps extends Omit<PressableProps, 'children' | 'style' | 'disabled'> {
  disabled?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: SlidingButtonTone;
  shape?: 'pill' | 'circle';
  size?: 'sm' | 'default' | 'lg';
  borderRadius?: number;
  className?: string;
  bare?: boolean;
}

type PressableRef = React.ComponentRef<typeof AnimatedPressable>;

function useSliderThumbPress(filled: boolean) {
  const press = useSharedValue(0);
  const onPressIn = () => {
    press.value = withSpring(1, SPRING_CONFIGS.snappy);
  };
  const onPressOut = () => {
    press.value = withSpring(0, SPRING_CONFIGS.snappy);
  };
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: filled ? 1 - press.value * 0.04 : 0.9 + press.value * 0.1 }],
    opacity: filled ? 1 : press.value,
  }));
  return { onPressIn, onPressOut, animatedStyle };
}

function SlidingButtonInner(
  {
    children,
    style,
    tone = 'primary',
    shape = 'pill',
    size = 'default',
    borderRadius = IOS_SLIDER.radius,
    disabled,
    className,
    bare = false,
    onPressIn,
    onPressOut,
    ...props
  }: SlidingButtonProps,
  ref: React.ForwardedRef<PressableRef>,
) {
  const isTinted = useSettingsStore((s) => s.uiStyle) === 'tinted';
  const filled = tone !== 'ghost';
  const accent: SliderAccent = tone === 'ghost' ? 'neutral' : tone;
  const [trackWidth, setTrackWidth] = useState(0);
  const { onPressIn: thumbIn, onPressOut: thumbOut, animatedStyle: thumbAnim } = useSliderThumbPress(filled);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const thumbColors = getSliderThumbColors(accent, isTinted);
  const thumbW = trackWidth > IOS_SLIDER.thumbInset * 2 ? trackWidth - IOS_SLIDER.thumbInset * 2 : 0;

  const trackMinH =
    size === 'lg'
      ? IOS_SLIDER.trackMinHeightLg
      : size === 'sm'
        ? IOS_SLIDER.trackMinHeightSm
        : IOS_SLIDER.trackMinHeight;

  const inner = (
    <View
      style={[
        iosSliderStyles.track,
        shape === 'pill' && size === 'lg' && iosSliderStyles.trackLg,
        shape === 'pill' && size === 'sm' && iosSliderStyles.trackSm,
        shape === 'circle' ? { flex: 1, aspectRatio: 1 } : { minHeight: trackMinH },
      ]}
      onLayout={onTrackLayout}
    >
      {thumbW > 0 ? (
        <Animated.View
          pointerEvents="none"
          style={[
            iosSliderStyles.thumb,
            shape === 'circle' ? iosSliderStyles.thumbCircle : { width: thumbW },
            thumbColors,
            thumbAnim,
          ]}
        />
      ) : null}
      <View style={iosSliderStyles.content}>{children}</View>
    </View>
  );

  const accentColor =
    accent === 'danger' ? COLORS.danger : accent === 'secondary' ? COLORS.secondary : COLORS.primary;

  const bareShellStyle =
    bare && shape === 'circle'
      ? {
          backgroundColor: 'rgba(255, 255, 255, 0.08)',
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: 'rgba(255, 255, 255, 0.14)',
        }
      : undefined;

  const shell = bare ? (
    <View style={[{ borderRadius, overflow: 'hidden' }, bareShellStyle, style]}>{inner}</View>
  ) : (
    <IosGlassSurface
      variant={tone === 'primary' ? 'accent' : 'glass'}
      radius={borderRadius}
      padding={IOS_SLIDER.trackPadding}
      shadow={tone === 'primary' ? 'soft' : 'none'}
      accentColor={accentColor}
      style={style}
    >
      {inner}
    </IosGlassSurface>
  );

  return (
    <AnimatedPressable
      ref={ref}
      disabled={disabled === true}
      hapticFeedback="light"
      className={className}
      style={{ borderRadius, opacity: disabled ? 0.45 : 1 }}
      onPressIn={(e) => {
        if (!disabled) thumbIn();
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        thumbOut();
        onPressOut?.(e);
      }}
      {...props}
    >
      {shell}
    </AnimatedPressable>
  );
}

export const SlidingButton = React.forwardRef<PressableRef, SlidingButtonProps>(SlidingButtonInner);

SlidingButton.displayName = 'SlidingButton';

export function SliderButtonLabel({
  children,
  tone = 'primary',
  selected = true,
  size = 'default',
}: {
  children: ReactNode;
  tone?: SlidingButtonTone;
  selected?: boolean;
  size?: 'sm' | 'default' | 'lg';
}) {
  const accent: SliderAccent = tone === 'ghost' ? 'neutral' : tone;
  const fontSize =
    size === 'lg' ? IOS_SLIDER.labelSizeLg : size === 'sm' ? IOS_SLIDER.labelSizeSm : IOS_SLIDER.labelSize;
  const color = getSliderLabelColor(accent, selected || tone !== 'ghost');

  if (typeof children === 'string') {
    return (
      <Text
        style={{
          fontFamily: selected || tone !== 'ghost' ? FONTS.bold : FONTS.medium,
          fontSize,
          color,
        }}
      >
        {children}
      </Text>
    );
  }
  return <>{children}</>;
}
