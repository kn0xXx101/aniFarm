import { Platform, Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import { useSettingsStore } from '@/lib/stores/settings-store';
import {
  getTabBarBottomOffset,
  IOS_TAB_BAR_HEIGHT,
  TAB_BAR_MARGIN_H,
} from '@/lib/tab-bar-style';

const HIDDEN_ROUTES = new Set([
  'analytics',
  'alerts',
  'count-live',
  'count-image',
  'count-video',
]);

/**
 * iOS 26–style floating tab bar: liquid glass blur, capsule shape, active pill highlight.
 */
export function IosGlassTabBar({ state, descriptors, navigation, style }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const uiStyle = useSettingsStore((s) => s.uiStyle);
  const isTinted = uiStyle === 'tinted';
  const bottomOffset = getTabBarBottomOffset();
  const safePad = Platform.OS === 'ios' ? insets.bottom : 10;

  if ((style as ViewStyle)?.display === 'none') {
    return null;
  }

  const visibleRoutes = state.routes.filter((r) => !HIDDEN_ROUTES.has(r.name));

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: bottomOffset,
          paddingBottom: safePad,
          marginHorizontal: TAB_BAR_MARGIN_H,
        },
        style as ViewStyle,
      ]}
    >
      <View style={styles.capsule}>
        {isTinted ? (
          <View style={[StyleSheet.absoluteFill, styles.tintedBar]} />
        ) : Platform.OS === 'web' ? (
          <View style={[StyleSheet.absoluteFill, styles.webGlass]} />
        ) : (
          <BlurView intensity={72} tint="dark" style={StyleSheet.absoluteFill} />
        )}
        {!isTinted ? <View style={styles.glassTint} pointerEvents="none" /> : null}
        <View style={[styles.glassBorder, isTinted && styles.tintedBorder]} pointerEvents="none" />
        {!isTinted ? <View style={styles.glassHighlight} pointerEvents="none" /> : null}

        <View style={styles.row}>
          {visibleRoutes.map((route) => {
            const { options } = descriptors[route.key];
            const label =
              typeof options.tabBarLabel === 'string'
                ? options.tabBarLabel
                : options.title ?? route.name;
            const isFocused = state.routes[state.index]?.key === route.key;
            const color = isFocused ? COLORS.primary : COLORS.inkMuted;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });
              if (!isFocused && !event.defaultPrevented) {
                if (Platform.OS === 'ios') {
                  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                navigation.navigate(route.name, route.params);
              }
            };

            const onLongPress = () => {
              navigation.emit({ type: 'tabLongPress', target: route.key });
            };

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel ?? String(label)}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.item}
              >
                <View style={styles.itemInner}>
                  {options.tabBarIcon?.({
                    focused: isFocused,
                    color,
                    size: 22,
                  })}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.label,
                      {
                        color,
                        fontFamily: isFocused ? FONTS.semibold : FONTS.medium,
                      },
                    ]}
                  >
                    {String(label)}
                  </Text>
                  {isFocused ? <View style={styles.dot} /> : <View style={styles.dotPlaceholder} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  capsule: {
    minHeight: IOS_TAB_BAR_HEIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 16,
  },
  webGlass: {
    backgroundColor: 'rgba(26, 37, 32, 0.82)',
    backdropFilter: 'blur(20px)',
  },
  tintedBar: {
    backgroundColor: COLORS.surfaceElevated,
  },
  tintedBorder: {
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  glassTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  glassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    borderRadius: 999,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 6,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    paddingVertical: 4,
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
    marginTop: 2,
  },
  dotPlaceholder: {
    width: 4,
    height: 4,
    marginTop: 2,
  },
  label: {
    fontSize: 10,
    letterSpacing: 0.15,
  },
});
