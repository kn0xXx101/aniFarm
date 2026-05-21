import { StyleSheet } from 'react-native';

import { COLORS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

export const IOS_SLIDER = {
  trackPadding: 4,
  trackMinHeight: 40,
  trackMinHeightLg: 48,
  trackMinHeightSm: 36,
  thumbInset: 2,
  labelSize: 13,
  labelSizeLg: 15,
  labelSizeSm: 12,
  radius: IOS_GLASS.radiusPill,
} as const;

export type SliderAccent = 'primary' | 'secondary' | 'danger' | 'neutral';

export function getSliderThumbColors(accent: SliderAccent, isTinted: boolean) {
  switch (accent) {
    case 'danger':
      return {
        backgroundColor: isTinted ? COLORS.dangerLight : 'rgba(196, 92, 92, 0.22)',
        borderColor: isTinted ? COLORS.danger : 'rgba(196, 92, 92, 0.45)',
      };
    case 'secondary':
      return {
        backgroundColor: isTinted ? COLORS.secondaryLight : 'rgba(123, 168, 196, 0.22)',
        borderColor: isTinted ? COLORS.secondary : 'rgba(123, 168, 196, 0.45)',
      };
    case 'neutral':
      return {
        backgroundColor: isTinted ? COLORS.surfaceElevated : 'rgba(255, 255, 255, 0.08)',
        borderColor: isTinted ? COLORS.borderSoft : 'rgba(255, 255, 255, 0.18)',
      };
    case 'primary':
    default:
      return {
        backgroundColor: isTinted ? COLORS.primaryLight : 'rgba(107, 191, 123, 0.22)',
        borderColor: isTinted ? COLORS.primary : 'rgba(107, 191, 123, 0.45)',
      };
  }
}

export function getSliderLabelColor(accent: SliderAccent, selected: boolean) {
  if (!selected) return COLORS.inkMuted;
  switch (accent) {
    case 'danger':
      return COLORS.danger;
    case 'secondary':
      return COLORS.secondary;
    case 'neutral':
      return COLORS.ink;
    case 'primary':
    default:
      return COLORS.primary;
  }
}

export const iosSliderStyles = StyleSheet.create({
  track: {
    position: 'relative',
    justifyContent: 'center',
    minHeight: IOS_SLIDER.trackMinHeight,
  },
  trackLg: {
    minHeight: IOS_SLIDER.trackMinHeightLg,
  },
  trackSm: {
    minHeight: IOS_SLIDER.trackMinHeightSm,
  },
  thumb: {
    position: 'absolute',
    top: IOS_SLIDER.thumbInset,
    left: IOS_SLIDER.thumbInset,
    bottom: IOS_SLIDER.thumbInset,
    borderRadius: IOS_SLIDER.radius,
    borderWidth: StyleSheet.hairlineWidth,
  },
  thumbCircle: {
    top: IOS_SLIDER.thumbInset,
    left: IOS_SLIDER.thumbInset,
    right: IOS_SLIDER.thumbInset,
    bottom: IOS_SLIDER.thumbInset,
    borderRadius: 9999,
  },
  content: {
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
