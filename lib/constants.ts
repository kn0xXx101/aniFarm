import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(30 100% 98%)',
    border: 'hsl(24 60% 90%)',
    card: 'hsl(0 0% 100%)',
    notification: 'hsl(348 90% 56%)',
    primary: 'hsl(18 95% 58%)',
    text: 'hsl(15 30% 12%)',
  },
  dark: {
    background: 'hsl(18 35% 7%)',
    border: 'hsl(18 18% 20%)',
    card: 'hsl(18 28% 11%)',
    notification: 'hsl(348 85% 58%)',
    primary: 'hsl(22 95% 60%)',
    text: 'hsl(30 30% 96%)',
  },
};

/** Shared brand gradient stops (sunrise → tropical). */
export const SUNRISE_GRADIENT = ['#FF6A3D', '#FF8E53', '#FFB347'] as const;
export const TROPICAL_GRADIENT = ['#FF5E62', '#FF9966', '#FFC371'] as const;
export const SKY_GRADIENT = ['#36D1DC', '#5B86E5'] as const;
export const SUNSET_GRADIENT = ['#FF512F', '#F09819'] as const;

export const LIGHT_THEME: Theme = {
  dark: false,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.light,
};
export const DARK_THEME: Theme = {
  dark: true,
  fonts: {
    regular: {
      fontFamily: NAV_FONTS.regular,
      fontWeight: '400',
    },
    medium: {
      fontFamily: NAV_FONTS.medium,
      fontWeight: '500',
    },
    bold: {
      fontFamily: NAV_FONTS.bold,
      fontWeight: '600',
    },
    heavy: {
      fontFamily: NAV_FONTS.heavy,
      fontWeight: '700',
    },
  },
  colors: NAV_THEME.dark,
};
