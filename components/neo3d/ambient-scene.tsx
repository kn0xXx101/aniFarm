import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS } from '@/lib/design-system';

function Orb({
  size,
  top,
  left,
  colors,
  delay = 0,
}: {
  size: number;
  top: number;
  left: number;
  colors: readonly [string, string];
  delay?: number;
}) {
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const start = () => {
      y.value = withRepeat(
        withSequence(
          withTiming(-18, { duration: 2800 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 2800 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.08, { duration: 3200 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3200 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    };
    const t = setTimeout(start, delay);
    return () => clearTimeout(t);
  }, [delay, scale, y]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          top,
          left,
          opacity: 0.45,
        },
        style,
      ]}
    >
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
    </Animated.View>
  );
}

export function AmbientScene() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[COLORS.canvas, COLORS.canvasMid, COLORS.canvas]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Orb size={220} top={-40} left={-60} colors={[COLORS.primary, 'transparent']} delay={0} />
      <Orb size={180} top={120} left={220} colors={[COLORS.secondary, 'transparent']} delay={400} />
      <Orb size={140} top={380} left={-30} colors={[COLORS.accent, 'transparent']} delay={800} />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: 'rgba(6,11,20,0.55)',
        }}
      />
    </View>
  );
}
