import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LAYOUT } from '@/lib/design-system';
import { getTabBarContentInset } from '@/lib/tab-bar-style';

/** Bottom padding so scroll content clears the tab bar + home indicator. */
export function useScreenInsets(withTabs = true) {
  const insets = useSafeAreaInsets();
  const bottom = withTabs
    ? getTabBarContentInset(insets.bottom)
    : Math.max(insets.bottom, Platform.OS === 'web' ? 8 : 12) + 16;

  return {
    top: insets.top,
    bottom,
    horizontal: LAYOUT.screenPadding,
  };
}
