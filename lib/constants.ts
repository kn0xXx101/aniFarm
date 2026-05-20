import type { Theme } from '@react-navigation/native';

import { BRAND, COLORS, FONTS, GRADIENTS, NEON, LAYOUT, SHADOW } from '@/lib/design-system';

export { BRAND, COLORS, FONTS, GRADIENTS, NEON, LAYOUT, SHADOW };
export { SUNRISE_GRADIENT, TROPICAL_GRADIENT, SKY_GRADIENT, SUNSET_GRADIENT } from '@/lib/design-system';

const NAV_COLORS = {
  background: COLORS.canvas,
  border: COLORS.borderSoft,
  card: COLORS.surface,
  notification: COLORS.primary,
  primary: COLORS.primary,
  text: COLORS.ink,
};

export const NAV_THEME = {
  light: NAV_COLORS,
  dark: NAV_COLORS,
};

export const LIGHT_THEME: Theme = {
  dark: true,
  fonts: {
    regular: { fontFamily: FONTS.regular, fontWeight: '400' },
    medium: { fontFamily: FONTS.medium, fontWeight: '500' },
    bold: { fontFamily: FONTS.semibold, fontWeight: '600' },
    heavy: { fontFamily: FONTS.bold, fontWeight: '700' },
  },
  colors: NAV_THEME.dark,
};

export const DARK_THEME: Theme = { ...LIGHT_THEME, dark: true };
