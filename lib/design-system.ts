/**
 * Meadow Field — organic dark theme for aniFarm.
 * Warm earth tones, sage greens, wheat accents. MVP-ready and field-friendly.
 */

export const BRAND = {
  name: 'aniFarm',
  tagline: 'Smart livestock counting',
  domain: 'anifarm.app',
} as const;

/** Core palette */
export const COLORS = {
  canvas: '#0D1412',
  canvasMid: '#121A17',
  surface: '#1A2520',
  surfaceMuted: '#243029',
  surfaceGlass: 'rgba(26, 37, 32, 0.78)',
  surfaceElevated: '#2A3830',

  primary: '#6BBF7B',
  primaryDark: '#4A9E5C',
  primaryLight: 'rgba(107, 191, 123, 0.18)',

  secondary: '#7BA8C4',
  secondaryDark: '#5A8AA8',
  secondaryLight: 'rgba(123, 168, 196, 0.18)',
  accent: '#C9A66B',
  accentLight: 'rgba(201, 166, 107, 0.18)',
  accentWarm: '#E8C88A',
  soil: '#5C4A32',

  alive: '#6BBF7B',
  dead: '#C45C5C',
  human: '#8B9299',

  ink: '#F0EDE6',
  inkSecondary: '#B8B4AC',
  inkMuted: '#7A766E',

  border: 'rgba(107, 191, 123, 0.32)',
  borderSoft: 'rgba(255, 255, 255, 0.08)',
  borderWarm: 'rgba(201, 166, 107, 0.35)',

  danger: '#C45C5C',
  dangerLight: 'rgba(196, 92, 92, 0.18)',
  warning: '#E8B86D',
  success: '#6BBF7B',
  info: '#7BA8C4',

  overlay: 'rgba(13, 20, 18, 0.72)',
} as const;

/** Fraunces (display) + DM Sans (UI) — loaded in root _layout */
export const FONTS = {
  display: 'Fraunces_700Bold',
  extrabold: 'Fraunces_700Bold',
  bold: 'DMSans_700Bold',
  semibold: 'DMSans_600SemiBold',
  medium: 'DMSans_500Medium',
  regular: 'DMSans_400Regular',
} as const;

export const GRADIENTS = {
  hero: ['#6BBF7B', '#4A9E5C'] as const,
  heroSoft: ['#2A4534', '#1A3024'] as const,
  glass: ['rgba(36, 58, 48, 0.92)', 'rgba(20, 32, 26, 0.96)'] as const,
  meadow: ['#1E3328', '#0D1412'] as const,
  dawn: ['#7BA8C4', '#5A8AA8'] as const,
  wheat: ['#E8C88A', '#C9A66B'] as const,
  sunset: ['#E8B86D', '#C45C5C'] as const,
  sky: ['#5A8AA8', '#3D6B85'] as const,
  tropical: ['#6BBF7B', '#7BA8C4'] as const,
} as const;

/** Soft glow accents + legacy aliases used across shell components */
export const NEON = {
  green: '#6BBF7B',
  greenGlow: 'rgba(107, 191, 123, 0.45)',
  cyan: '#7BA8C4',
  blue: '#7BA8C4',
  purple: '#9B8EC4',
  amber: '#E8C88A',
  pink: '#C45C5C',
  bgDeep: '#0D1412',
  bgCard: '#1A2520',
} as const;

export const SUNRISE_GRADIENT = GRADIENTS.wheat;
export const TROPICAL_GRADIENT = GRADIENTS.tropical;
export const SKY_GRADIENT = GRADIENTS.dawn;
export const SUNSET_GRADIENT = GRADIENTS.sunset;

export const LAYOUT = {
  radius: 18,
  radiusMd: 22,
  radiusLg: 28,
  radiusHero: 32,
  radiusPill: 999,
  tabBarHeight: 62,
  headerHeight: 56,
  screenPadding: 20,
  contentMaxWidth: 480,
  gap: 12,
  gapLg: 20,
} as const;

export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  hero: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  neon: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  soft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 2,
  },
} as const;
