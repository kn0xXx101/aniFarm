import { Platform } from 'react-native';

/** iOS 26 Liquid Glass design tokens */
export const IOS_GLASS = {
  blurIntensity: 56,
  blurIntensityStrong: 72,
  tint: 'dark' as const,
  radius: 28,
  radiusMd: 22,
  radiusSm: 18,
  radiusHero: 32,
  radiusPill: 999,
  /** Header chrome: brand paw, alerts, back — keep touch targets aligned */
  headerIconSize: 40,
  headerIconGlyph: 20,
  headerChromeRadius: 14,
  headerClusterGap: 12,
  border: 'rgba(255, 255, 255, 0.2)',
  borderSoft: 'rgba(255, 255, 255, 0.1)',
  highlight: 'rgba(255, 255, 255, 0.14)',
  tintFill: 'rgba(255, 255, 255, 0.07)',
  tintFillStrong: 'rgba(255, 255, 255, 0.11)',
  webFill: 'rgba(26, 37, 32, 0.78)',
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.38,
    shadowRadius: 20,
    elevation: 10,
  },
  shadowSoft: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 12,
    elevation: 4,
  },
} as const;

export function isGlassBlurSupported(): boolean {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

/** Centered icon well for top-bar pills and glass icon buttons */
export const headerIconWellStyle = {
  width: IOS_GLASS.headerIconSize,
  height: IOS_GLASS.headerIconSize,
  alignItems: 'center' as const,
  justifyContent: 'center' as const,
};
