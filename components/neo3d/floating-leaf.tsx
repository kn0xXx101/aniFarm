import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Leaf } from 'lucide-react-native';

import { COLORS } from '@/lib/design-system';

interface FloatingLeafProps {
  size?: number;
  top: number;
  left: number;
  color?: string;
  delay?: number;
  rotate?: number;
}

export function FloatingLeaf({
  size = 18,
  top,
  left,
  color = COLORS.primary,
  delay = 0,
  rotate = -15,
}: FloatingLeafProps) {
  const y = useSharedValue(0);
  const rot = useSharedValue(rotate);
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    const start = () => {
      y.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 2400 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(6, { duration: 2600 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      rot.value = withRepeat(
        withSequence(
          withTiming(rotate + 12, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(rotate - 8, { duration: 3000 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.55, { duration: 2000 }),
          withTiming(0.25, { duration: 2000 })
        ),
        -1,
        true
      );
    };
    const t = setTimeout(start, delay);
    return () => clearTimeout(t);
  }, [delay, opacity, rot, rotate, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { rotate: `${rot.value}deg` }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.leaf, { top, left }, style]} pointerEvents="none">
      <Leaf size={size} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  leaf: {
    position: 'absolute',
  },
});
