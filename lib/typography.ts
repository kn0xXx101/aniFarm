import type { TextStyle } from 'react-native';

import { COLORS, FONTS, TYPE } from '@/lib/design-system';

export { TYPE };

const WEIGHT_FONT: Record<string, string> = {
  regular: FONTS.regular,
  medium: FONTS.medium,
  semibold: FONTS.semibold,
  bold: FONTS.bold,
};

export function fontForWeight(weight?: string | null): string {
  if (weight && weight in WEIGHT_FONT) return WEIGHT_FONT[weight];
  return FONTS.regular;
}

export function colorForVariant(variant?: string | null): string {
  switch (variant) {
    case 'muted':
      return COLORS.inkSecondary;
    case 'destructive':
      return COLORS.danger;
    default:
      return COLORS.ink;
  }
}

/** Merge design-system type tokens with overrides */
export function typeStyle(token: keyof typeof TYPE, overrides?: TextStyle): TextStyle {
  return { ...TYPE[token], ...overrides };
}
