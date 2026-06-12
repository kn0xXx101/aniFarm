import { Platform, type ViewStyle } from 'react-native';

import { LAYOUT } from '@/lib/design-system';

export const TAB_BAR_MARGIN_H = 20;
const TAB_FLOAT_GAP = 6;
const CONTENT_GAP = 14;

/** iOS 26–style glass capsule inner height (excluding safe-area padding). */
export const IOS_TAB_BAR_HEIGHT = 62;

/** Distance from screen bottom to tab bar container. */
export function getTabBarBottomOffset(): number {
  return Platform.OS === 'web' ? 12 : TAB_FLOAT_GAP;
}

/** Scroll/content padding so lists clear the floating tab bar + home indicator. */
export function getTabBarContentInset(bottomInset = 0): number {
  const offset = getTabBarBottomOffset();
  const safePad = Platform.OS === 'ios' ? bottomInset : 10;
  return offset + IOS_TAB_BAR_HEIGHT + safePad + CONTENT_GAP;
}

/** Style hook for hide/show — custom glass bar reads `display: 'none'`. */
export function getDefaultTabBarStyle(bottomInset = 0): ViewStyle {
  const offset = getTabBarBottomOffset();
  const safePad = Platform.OS === 'ios' ? bottomInset : 10;

  return {
    position: 'absolute',
    left: TAB_BAR_MARGIN_H,
    right: TAB_BAR_MARGIN_H,
    bottom: offset,
    paddingTop: 0,
    paddingBottom: safePad,
    minHeight: IOS_TAB_BAR_HEIGHT,
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
  };
}

/** @deprecated Use IOS_TAB_BAR_HEIGHT */
export const tabBarHeight = LAYOUT.tabBarHeight;
