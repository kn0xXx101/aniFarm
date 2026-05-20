import { Platform, type ViewStyle } from 'react-native';

import { COLORS, LAYOUT } from '@/lib/design-system';

/** Default floating tab bar style (matches `(tabs)/_layout`). */
export function getDefaultTabBarStyle(bottomInset = 0): ViewStyle {
  const paddingBottom = Platform.OS === 'web' ? 10 : Math.max(bottomInset, 12);

  return {
    position: 'absolute',
    height: LAYOUT.tabBarHeight + paddingBottom,
    paddingTop: 6,
    paddingBottom,
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.borderSoft,
    borderTopWidth: 1,
    elevation: 0,
  };
}
