import { useLayoutEffect } from 'react';
import { useNavigation } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getDefaultTabBarStyle } from '@/lib/tab-bar-style';

/** Hides the tab bar while mounted (count flows, full-bleed screens). */
export function useHideTabBar() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  useLayoutEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ tabBarStyle: { display: 'none' } });
    return () => {
      parent?.setOptions({ tabBarStyle: getDefaultTabBarStyle(insets.bottom) as object });
    };
  }, [navigation, insets.bottom]);
}
