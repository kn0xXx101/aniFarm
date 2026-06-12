/**
 * useSlideFill — iOS 26 slider press animation.
 *
 * On press: a translucent fill expands left→right across the pill track,
 * with a small leading thumb dot that travels ahead of the fill.
 * On release: both snap back with a spring.
 *
 * This is the core visual mechanic of iOS 26's interactive button language.
 */

import { useCallback } from 'react';
import { StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
} from 'react-native-reanimated';

import { COLORS } from '@/lib/design-system';

const SPRING_IN  = { damping: 18, stiffness: 280, mass: 0.7 } as const;
// const SPRING_OUT = { damping: 22, stiffness: 200, mass: 0.8 } as const;

const THUMB_W  = 8;
const THUMB_H  = 8;
const THUMB_INSET = 6;

interface UseSlideFillOptions {
  disabled?: boolean;
  fillColor?: string;
  shape?: 'pill' | 'circle';
  borderRadius?: number;
}

export function useSlideFill({
  disabled,
  fillColor = COLORS.primary,
  shape = 'pill',
  borderRadius = 999,
}: UseSlideFillOptions = {}) {
  const progress   = useSharedValue(0);
  const trackWidth = useSharedValue(0);

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.value = e.nativeEvent.layout.width;
    },
    [trackWidth],
  );

  // Fill bar — grows from left edge to full width
  const fillStyle = useAnimatedStyle(() => {
    if (shape === 'circle') {
      return {
        transform: [{ scale: 0.3 + progress.value * 0.7 }],
        opacity: 0.15 + progress.value * 0.45,
      };
    }
    const w = trackWidth.value * progress.value;
    return {
      width: Math.max(0, w),
      opacity: 0.18 + progress.value * 0.32,
    };
  });

  // Thumb dot — leads slightly ahead of the fill
  const thumbStyle = useAnimatedStyle(() => {
    if (shape === 'circle') return { opacity: 0 };
    const maxTravel = Math.max(0, trackWidth.value - THUMB_W - THUMB_INSET * 2);
    return {
      transform: [{ translateX: THUMB_INSET + progress.value * maxTravel }],
      opacity: progress.value * 0.85,
    };
  });

  const onPressIn = () => {
    if (disabled) return;
    progress.value = withSpring(1, SPRING_IN);
  };

  const onPressOut = () => {
    progress.value = withTiming(0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  };

  const Fill = () => (
    <>
      {/* Expanding fill bar */}
      <Animated.View
        pointerEvents="none"
        style={[
          shape === 'circle' ? styles.fillCircle : styles.fill,
          { backgroundColor: fillColor, borderRadius },
          fillStyle,
        ]}
      />
      {/* Leading thumb dot */}
      {shape === 'pill' ? (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.thumb,
            { backgroundColor: fillColor },
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
    top: '50%',
    marginTop: -(THUMB_H / 2),
    width: THUMB_W,
    height: THUMB_H,
    borderRadius: THUMB_W / 2,
    left: 0,
  },
});
