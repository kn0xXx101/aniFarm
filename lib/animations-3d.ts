/**
 * Advanced 3D Animation Utilities
 * Reanimated-based 3D transforms, parallax, and particle effects
 */

import {
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  type WithSpringConfig,
  type WithTimingConfig,
} from 'react-native-reanimated';

// Enhanced spring configurations for 3D
export const SPRING_3D = {
  gentle: {
    damping: 20,
    stiffness: 120,
    mass: 1,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  
  bouncy: {
    damping: 12,
    stiffness: 180,
    mass: 0.8,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  
  snappy: {
    damping: 18,
    stiffness: 250,
    mass: 0.6,
    overshootClamping: false,
  } satisfies WithSpringConfig,
  
  elastic: {
    damping: 8,
    stiffness: 150,
    mass: 1.2,
    overshootClamping: false,
  } satisfies WithSpringConfig,
} as const;

// Enhanced timing configurations
export const TIMING_3D = {
  smooth: {
    duration: 300,
    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  } satisfies WithTimingConfig,
  
  easeOut: {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  } satisfies WithTimingConfig,
  
  easeInOut: {
    duration: 500,
    easing: Easing.inOut(Easing.cubic),
  } satisfies WithTimingConfig,
  
  elastic: {
    duration: 600,
    easing: Easing.elastic(1.2),
  } satisfies WithTimingConfig,
} as const;

/**
 * Create a 3D card flip animation
 */
export function createFlipAnimation(toValue: number) {
  'worklet';
  return withSpring(toValue, SPRING_3D.bouncy);
}

/**
 * Create a floating animation (continuous up/down)
 */
export function createFloatAnimation(distance = 10) {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(-distance, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
}

/**
 * Create a pulsing glow animation
 */
export function createGlowAnimation(minOpacity = 0.6, maxOpacity = 1) {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(maxOpacity, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(minOpacity, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ),
    -1,
    true
  );
}

/**
 * Create a rotation animation
 */
export function createRotateAnimation(duration = 2000) {
  'worklet';
  return withRepeat(
    withTiming(360, { duration, easing: Easing.linear }),
    -1,
    false
  );
}

/**
 * Create a scale pulse animation
 */
export function createPulseAnimation(minScale = 1, maxScale = 1.1) {
  'worklet';
  return withRepeat(
    withSequence(
      withSpring(maxScale, SPRING_3D.gentle),
      withSpring(minScale, SPRING_3D.gentle)
    ),
    -1,
    true
  );
}

/**
 * Create a bounce animation
 */
export function createBounceAnimation(height = 20) {
  'worklet';
  return withRepeat(
    withSequence(
      withTiming(-height, { duration: 400, easing: Easing.out(Easing.quad) }),
      withTiming(0, { duration: 400, easing: Easing.in(Easing.quad) })
    ),
    -1,
    false
  );
}

/**
 * Create a shimmer animation for loading states
 */
export function createShimmerAnimation() {
  'worklet';
  return withRepeat(
    withTiming(1, { duration: 1500, easing: Easing.linear }),
    -1,
    false
  );
}

/**
 * Create a parallax scroll effect
 */
export function createParallaxEffect(scrollY: number, speed = 0.5) {
  'worklet';
  return scrollY * speed;
}

/**
 * Create a 3D tilt effect based on touch position
 */
export function create3DTilt(x: number, y: number, width: number, height: number, intensity = 10) {
  'worklet';
  const centerX = width / 2;
  const centerY = height / 2;
  
  const rotateY = ((x - centerX) / centerX) * intensity;
  const rotateX = -((y - centerY) / centerY) * intensity;
  
  return { rotateX, rotateY };
}

/**
 * Create a staggered animation for lists
 */
export function createStaggerAnimation(index: number, delay = 100) {
  'worklet';
  return withDelay(
    index * delay,
    withSpring(1, SPRING_3D.bouncy)
  );
}

/**
 * Create a wave animation for multiple elements
 */
export function createWaveAnimation(index: number, total: number, duration = 2000) {
  'worklet';
  const phase = (index / total) * Math.PI * 2;
  return withRepeat(
    withTiming(1, {
      duration,
      easing: (t) => Math.sin(t * Math.PI * 2 + phase) * 0.5 + 0.5,
    }),
    -1,
    false
  );
}

/**
 * Create a magnetic snap animation
 */
export function createMagneticSnap(value: number, snapPoints: number[], threshold = 50) {
  'worklet';
  const closest = snapPoints.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
  
  if (Math.abs(value - closest) < threshold) {
    return withSpring(closest, SPRING_3D.snappy);
  }
  
  return value;
}

/**
 * Create a rubber band effect
 */
export function createRubberBand(value: number, min: number, max: number, resistance = 0.5) {
  'worklet';
  if (value < min) {
    return min - (min - value) * resistance;
  }
  if (value > max) {
    return max + (value - max) * resistance;
  }
  return value;
}

/**
 * Create a spring-based drag animation
 */
export function createDragSpring(velocity: number) {
  'worklet';
  return withSpring(0, {
    ...SPRING_3D.gentle,
    velocity,
  });
}

/**
 * Create a morphing animation between shapes
 */
export function createMorphAnimation(progress: number, from: number, to: number) {
  'worklet';
  return from + (to - from) * progress;
}
