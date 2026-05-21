import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefaultTabBarStyle } from '@/lib/tab-bar-style';

/** Hides the tab bar while mounted (count flows, full-bleed screens). */
export function useHideTabBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const hidden = { tabBarStyle: { display: 'none' } as const };
    const visible = { tabBarStyle: getDefaultTabBarStyle(insets.bottom) as object };
    navigation.setOptions(hidden);
    navigation.getParent()?.setOptions(hidden);
    return () => {
      navigation.setOptions(visible);
      navigation.getParent()?.setOptions(visible);
    };
  }, [navigation, insets.bottom]);
}
