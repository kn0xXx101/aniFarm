import type { ReactNode } from 'react';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

interface StaggerInProps {
  children: ReactNode;
  index?: number;
  direction?: 'up' | 'down';
}

export function StaggerIn({ children, index = 0, direction = 'up' }: StaggerInProps) {
  const entering =
    direction === 'up'
      ? FadeInUp.delay(index * 80).duration(420).springify().damping(18)
      : FadeInDown.delay(index * 80).duration(420).springify().damping(18);

  return <Animated.View entering={entering}>{children}</Animated.View>;
}
