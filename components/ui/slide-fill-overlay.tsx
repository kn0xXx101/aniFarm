import { useCallback } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { COLORS } from '@/lib/design-system';

interface UseSlideFillOptions {
  disabled?: boolean;
  fillColor?: string;
  /** Pill = width grows left→right; circle = scale from center */
  shape?: 'pill' | 'circle';
  borderRadius?: number;
}

export function useSlideFill({
  disabled,
  fillColor = COLORS.primary,
  shape = 'pill',
  borderRadius = 999,
}: UseSlideFillOptions = {}) {
  const progress = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  const fillStyle = useAnimatedStyle(() => {
    if (shape === 'circle') {
      return {
        transform: [{ scale: 0.4 + progress.value * 0.6 }],
        opacity: 0.22 + progress.value * 0.5,
      };
    }
    return {
      width: trackWidth.value * progress.value,
      opacity: 0.3 + progress.value * 0.4,
    };
  });

  const thumbStyle = useAnimatedStyle(() => {
    const thumbSize = 10;
    const maxX = Math.max(0, trackWidth.value - thumbSize - 8);
    return {
      transform: [{ translateX: 4 + progress.value * maxX }],
      opacity: progress.value * 0.9,
    };
  });

  const onPressIn = () => {
    if (disabled) return;
    progress.value = withTiming(1, { duration: 260, easing: Easing.out(Easing.cubic) });
  };

  const onPressOut = () => {
    progress.value = withTiming(0, { duration: 200, easing: Easing.in(Easing.cubic) });
  };

  const Fill = () => (
    <>
      <Animated.View
        pointerEvents="none"
        style={[
          shape === 'circle' ? styles.fillCircle : styles.fill,
          { backgroundColor: fillColor, borderRadius },
          fillStyle,
        ]}
      />
      {shape === 'pill' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { backgroundColor: fillColor, borderRadius: borderRadius / 2 },
            thumbStyle,
          ]}
        />
      ) : null}
    </>
  );

  return { onPressIn, onPressOut, Fill, onLayout };
}

const styles = StyleSheet.create({
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  fillCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  thumb: {
    position: 'absolute',
    top: 4,
    bottom: 4,
    left: 0,
    width: 10,
  },
});
