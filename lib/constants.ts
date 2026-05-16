import type { Theme } from '@react-navigation/native';

const NAV_FONTS = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  bold: 'Inter_600SemiBold',
  heavy: 'Inter_700Bold',
} as const;

export const NAV_THEME = {
  light: {
    background: 'hsl(0 0% 100%)',
    border: 'hsl(150 20% 88%)',
    card: 'hsl(0 0% 100%)',
    notification: 'hsl(0 84% 56%)',
    primary: 'hsl(142 72% 29%)',
    text: 'hsl(150 25% 10%)',
  },
  dark: {
    background: 'hsl(150 20% 6%)',
    border: 'hsl(150 12% 18%)',
    card: 'hsl(150 18% 9%)',
    notification: 'hsl(0 70% 52%)',
    primary: 'hsl(142 65% 45%)',
    text: 'hsl(0 0% 98%)',
  },
};

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
