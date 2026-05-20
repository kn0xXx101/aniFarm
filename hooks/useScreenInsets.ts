import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LAYOUT } from '@/lib/design-system';

/** Bottom padding so scroll content clears the tab bar + home indicator. */
export function useScreenInsets(withTabs = true) {
  const insets = useSafeAreaInsets();
  const tabBar = withTabs ? LAYOUT.tabBarHeight : 0;
  const bottom = tabBar + Math.max(insets.bottom, typeof window === 'undefined' ? 12 : 8);

  return {
    top: insets.top,
    bottom,
    horizontal: LAYOUT.screenPadding,
  };
}
