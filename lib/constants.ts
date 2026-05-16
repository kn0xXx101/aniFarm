import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

/**
 * Dark futuristic / neon NAV theme. We treat "light" and "dark" identically here
 * because the design is intentionally always-dark (mission-control console look).
 */
const NEON_COLORS = {
  background: 'hsl(222 47% 5%)',
  border: 'hsl(222 30% 16%)',
  card: 'hsl(222 40% 9%)',
  notification: 'hsl(152 100% 50%)',
  primary: 'hsl(152 100% 50%)',
  text: 'hsl(160 30% 96%)',
};

export const NAV_THEME = {
  light: NEON_COLORS,
  dark: { ...NEON_COLORS, background: 'hsl(222 47% 4%)', card: 'hsl(222 40% 8%)' },
};

/** Shared brand gradient stops (neon green → cyan → electric blue). */
// Kept under the legacy names so every screen automatically inherits the new look.
export const SUNRISE_GRADIENT = ['#00FFA3', '#00E5FF', '#0066FF'] as const; // primary brand
export const TROPICAL_GRADIENT = ['#7B2FF7', '#F107A3', '#00E5FF'] as const; // counts / actions
export const SKY_GRADIENT = ['#00E5FF', '#7B2FF7'] as const; // info / image
export const SUNSET_GRADIENT = ['#FF00C8', '#7B2FF7'] as const; // video / accent

/** Convenience neon swatches for inline styling. */
export const NEON = {
  green: '#00FFA3',
  cyan: '#00E5FF',
  violet: '#7B2FF7',
  pink: '#FF00C8',
  amber: '#FFD600',
  bgDeep: '#04060B',
  bgCard: '#0B1020',
  border: '#1B2238',
  textDim: 'rgba(225,235,245,0.6)',
} as const;

export const LIGHT_THEME: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: NAV_FONTS.regular, fontWeight: '400' },
    medium: { fontFamily: NAV_FONTS.medium, fontWeight: '500' },
    bold: { fontFamily: NAV_FONTS.bold, fontWeight: '600' },
    heavy: { fontFamily: NAV_FONTS.heavy, fontWeight: '700' },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: NAV_FONTS.regular, fontWeight: '400' },
    medium: { fontFamily: NAV_FONTS.medium, fontWeight: '500' },
    bold: { fontFamily: NAV_FONTS.bold, fontWeight: '600' },
    heavy: { fontFamily: NAV_FONTS.heavy, fontWeight: '700' },
  },
  colors: NAV_THEME.dark,
};
