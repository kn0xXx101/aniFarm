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

import { COLORS, GRADIENTS } from '@/lib/design-system';

function Orb({
  size,
  top,
  left,
  colors,
  delay = 0,
  opacity = 0.35,
}: {
  size: number;
  top: number;
  left: number;
  colors: readonly [string, string];
  delay?: number;
  opacity?: number;
}) {
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    const start = () => {
      y.value = withRepeat(
        withSequence(
          withTiming(-14, { duration: 3200 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(0, { duration: 3200 + delay, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
      scale.value = withRepeat(
        withSequence(
          withTiming(1.06, { duration: 3600 + delay, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 3600 + delay, easing: Easing.inOut(Easing.ease) })
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
          opacity,
        },
        style,
      ]}
    >
      <LinearGradient colors={colors} style={StyleSheet.absoluteFill} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} />
    </Animated.View>
  );
}

export function AmbientScene({ subdued }: { subdued?: boolean }) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient
        colors={[...GRADIENTS.meadow]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Orb size={240} top={-50} left={-70} colors={[COLORS.primary, 'transparent']} delay={0} />
      <Orb size={160} top={100} left={220} colors={[COLORS.secondary, 'transparent']} delay={500} opacity={0.28} />
      <Orb size={120} top={360} left={-20} colors={[COLORS.accent, 'transparent']} delay={900} opacity={0.22} />
      <View
        style={{
          ...StyleSheet.absoluteFillObject,
          backgroundColor: subdued ? 'rgba(13,20,18,0.65)' : 'rgba(13,20,18,0.5)',
        }}
      />
    </View>
  );
}
