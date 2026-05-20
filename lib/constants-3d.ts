/**
 * 3D Design System Constants
 * Enhanced visual system with depth, shadows, and advanced animations
 */

// 3D Transform presets
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

// Enhanced gradients with 3D depth
export const GRADIENTS_3D = {
  neonGlow: ['#00FFA3', '#00D98A', '#00B371'],
  cyberPurple: ['#A855F7', '#7C3AED', '#6D28D9'],
  deepOcean: ['#0EA5E9', '#0284C7', '#0369A1'],
  sunset: ['#F59E0B', '#F97316', '#EF4444'],
  aurora: ['#00FFA3', '#00D4FF', '#A855F7'],
  darkGlass: ['rgba(15, 23, 42, 0.8)', 'rgba(30, 41, 59, 0.6)'],
  lightGlass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
} as const;

// Advanced shadow system
export const SHADOWS_3D = {
  sm: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
  neon: {
    shadowColor: '#00FFA3',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  purple: {
    shadowColor: '#A855F7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

// Particle system configs
export const PARTICLES = {
  count: {
    low: 20,
    medium: 50,
    high: 100,
  },
  colors: ['#00FFA3', '#00D4FF', '#A855F7', '#F59E0B'],
  sizes: [2, 3, 4, 5],
  speeds: [0.5, 1, 1.5, 2],
} as const;

// 3D Card configurations
export const CARD_3D = {
  perspective: 1000,
  rotateIntensity: 10, // degrees
  shadowIntensity: 0.3,
  glowIntensity: 0.4,
} as const;

// Animation durations (ms)
export const DURATIONS = {
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
  particle: 2000,
} as const;

// Glassmorphism presets
export const GLASS = {
  light: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backdropFilter: 'blur(10px)',
  },
  medium: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(15px)',
  },
  dark: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
  },
  neon: {
    backgroundColor: 'rgba(0, 255, 163, 0.1)',
    borderColor: 'rgba(0, 255, 163, 0.3)',
    backdropFilter: 'blur(12px)',
  },
} as const;

// 3D Icon animations
export const ICON_ANIMATIONS = {
  pulse: {
    scale: [1, 1.2, 1],
    duration: 1000,
    loop: true,
  },
  rotate: {
    rotate: ['0deg', '360deg'],
    duration: 2000,
    loop: true,
  },
  bounce: {
    translateY: [0, -10, 0],
    duration: 800,
    loop: true,
  },
  glow: {
    opacity: [0.6, 1, 0.6],
    duration: 1500,
    loop: true,
  },
} as const;
