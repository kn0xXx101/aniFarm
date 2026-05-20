/**
 * Neon Field — dark agri-tech design system with 3D depth & neon accents.
 */

export const BRAND = {
  name: 'Poultra',
  tagline: '3D poultry intelligence for modern farms',
} as const;

export const FONTS = {
  regular: 'Outfit_400Regular',
  medium: 'Outfit_500Medium',
  semibold: 'Outfit_600SemiBold',
  bold: 'Outfit_700Bold',
  extrabold: 'Outfit_800ExtraBold',
} as const;

export const COLORS = {
  canvas: '#060B14',
  canvasMid: '#0A1220',
  surface: '#0F1729',
  surfaceMuted: '#151F35',
  surfaceGlass: 'rgba(15, 23, 41, 0.72)',
  ink: '#F1F5F9',
  inkSecondary: '#CBD5E1',
  inkMuted: '#64748B',
  primary: '#00FFA3',
  primaryDark: '#00D98A',
  primaryLight: 'rgba(0, 255, 163, 0.12)',
  secondary: '#00D4FF',
  secondaryLight: 'rgba(0, 212, 255, 0.12)',
  accent: '#A855F7',
  accentLight: 'rgba(168, 85, 247, 0.15)',
  cta: '#00FFA3',
  ctaDark: '#00B371',
  warning: '#FBBF24',
  warningLight: 'rgba(251, 191, 36, 0.15)',
  danger: '#FF4D6D',
  dangerLight: 'rgba(255, 77, 109, 0.15)',
  border: 'rgba(0, 255, 163, 0.18)',
  borderSoft: 'rgba(255, 255, 255, 0.06)',
  glow: '#00FFA3',
} as const;

export const SHADOW = {
  soft: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 6,
  },
  hero: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.35,
    shadowRadius: 32,
    elevation: 12,
  },
  neon: {
    shadowColor: COLORS.glow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const LAYOUT = {
  screenPadding: 20,
  sectionGap: 24,
  tabBarHeight: 68,
  tabBarBottomInset: 96,
  radiusSm: 12,
  radiusMd: 18,
  radiusLg: 24,
  radiusXl: 32,
  radiusHero: 28,
} as const;

export const GRADIENTS = {
  hero: ['#00FFA3', '#00D4FF', '#A855F7'] as const,
  brand: [COLORS.primary, COLORS.secondary] as const,
  cta: [COLORS.primary, COLORS.ctaDark] as const,
  aurora: [COLORS.primary, COLORS.secondary, COLORS.accent] as const,
  count: [COLORS.primary, COLORS.secondary] as const,
  image: [COLORS.secondary, COLORS.accent] as const,
  video: [COLORS.accent, COLORS.primary] as const,
  warm: [COLORS.warning, COLORS.danger] as const,
  glass: ['rgba(15,23,41,0.9)', 'rgba(6,11,20,0.95)'] as const,
  dark: [COLORS.canvasMid, COLORS.canvas] as const,
} as const;

export const SUNRISE_GRADIENT = GRADIENTS.brand;
export const TROPICAL_GRADIENT = GRADIENTS.count;
export const SKY_GRADIENT = GRADIENTS.image;
export const SUNSET_GRADIENT = GRADIENTS.video;

export const NEON = {
  green: COLORS.primary,
  cyan: COLORS.secondary,
  violet: COLORS.accent,
  pink: COLORS.danger,
  amber: COLORS.warning,
  bgDeep: COLORS.canvas,
  bgCard: COLORS.surface,
  border: COLORS.border,
  textDim: COLORS.inkMuted,
} as const;
