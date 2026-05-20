/**
 * 3D Design System Constants — Meadow Field organic palette
 */

export const TRANSFORMS_3D = {
  cardHover: {
    scale: 1.02,
    rotateX: '2deg',
    rotateY: '2deg',
    translateZ: 20,
  },
  cardPress: {
    scale: 0.98,
    translateZ: -10,
  },
  float: {
    translateY: -8,
    scale: 1.01,
  },
  flip: {
    rotateY: '180deg',
  },
  tilt: {
    rotateX: '5deg',
    rotateY: '5deg',
  },
} as const;

export const GRADIENTS_3D = {
  neonGlow: ['#6BBF7B', '#4A9E5C', '#3D8550'],
  cyberPurple: ['#9B8EC4', '#7C6BAD', '#6D5A9A'],
  deepOcean: ['#7BA8C4', '#5A8AA8', '#3D6B85'],
  sunset: ['#E8C88A', '#C9A66B', '#C45C5C'],
  aurora: ['#6BBF7B', '#7BA8C4', '#C9A66B'],
  darkGlass: ['rgba(26, 37, 32, 0.85)', 'rgba(13, 20, 18, 0.7)'],
  lightGlass: ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.03)'],
} as const;

export const SHADOWS_3D = {
  sm: {
    shadowColor: '#6BBF7B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#6BBF7B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#6BBF7B',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  neon: {
    shadowColor: '#6BBF7B',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },
  purple: {
    shadowColor: '#9B8EC4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 8,
  },
} as const;

export const PARTICLES = {
  count: {
    low: 20,
    medium: 50,
    high: 100,
  },
  colors: ['#6BBF7B', '#7BA8C4', '#C9A66B', '#E8C88A'],
  sizes: [2, 3, 4, 5],
  speeds: [0.5, 1, 1.5, 2],
} as const;

export const CARD_3D = {
  perspective: 1000,
  rotateIntensity: 10,
  shadowIntensity: 0.25,
  glowIntensity: 0.3,
} as const;

export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  particle: 2000,
} as const;

export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderColor: 'rgba(255, 255, 255, 0.12)',
    backdropFilter: 'blur(10px)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.18)',
    backdropFilter: 'blur(15px)',
  },
  dark: {
    backgroundColor: 'rgba(26, 37, 32, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
  },
  neon: {
    backgroundColor: 'rgba(107, 191, 123, 0.1)',
    borderColor: 'rgba(107, 191, 123, 0.28)',
    backdropFilter: 'blur(12px)',
  },
} as const;

export const ICON_ANIMATIONS = {
  pulse: {
    scale: [1, 1.15, 1],
    duration: 1000,
    loop: true,
  },
  rotate: {
    rotate: ['0deg', '360deg'],
    duration: 2000,
    loop: true,
  },
  bounce: {
    translateY: [0, -8, 0],
    duration: 800,
    loop: true,
  },
  glow: {
    opacity: [0.5, 0.9, 0.5],
    duration: 1500,
    loop: true,
  },
} as const;
