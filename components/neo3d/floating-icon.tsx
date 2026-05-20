import type { LucideIcon } from 'lucide-react-native';
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import { COLORS, SHADOW } from '@/lib/design-system';

interface FloatingIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  ring?: boolean;
}

export function FloatingIcon({ icon: Icon, size = 64, color = COLORS.primary, ring = true }: FloatingIconProps) {
  const floatY = useSharedValue(0);
  const rotateY = useSharedValue(0);

  useEffect(() => {
    floatY.value = withRepeat(
      withSequence(
        withTiming(-12, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
    rotateY.value = withRepeat(withTiming(8, { duration: 4000, easing: Easing.inOut(Easing.ease) }), -1, true);
  }, [floatY, rotateY]);

  const anim = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { translateY: floatY.value }, { rotateY: `${rotateY.value}deg` }],
  }));

  return (
    <Animated.View style={[{ alignItems: 'center', justifyContent: 'center' }, anim, SHADOW.neon]}>
      {ring ? (
        <View
          style={{
            position: 'absolute',
            width: 160,
            height: 160,
            borderRadius: 80,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
        />
      ) : null}
      <LinearGradient
        colors={[COLORS.primaryLight, COLORS.surface]}
        style={{
          width: 120,
          height: 120,
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: 1,
          borderColor: COLORS.border,
        }}
      >
        <Icon size={size} color={color} />
      </LinearGradient>
    </Animated.View>
  );
}
