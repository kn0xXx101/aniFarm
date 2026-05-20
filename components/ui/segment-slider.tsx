import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { SPRING_CONFIGS, triggerHaptic } from '@/lib/animations';

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentSliderProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

/**
 * iOS-style segmented control with a sliding thumb between options.
 */
export function SegmentSlider<T extends string>({ options, value, onChange }: SegmentSliderProps<T>) {
  const isTinted = useSettingsStore((s) => s.uiStyle) === 'tinted';
  const [trackWidth, setTrackWidth] = useState(0);
  const index = Math.max(0, options.findIndex((o) => o.value === value));
  const thumbX = useSharedValue(0);

  useEffect(() => {
    if (trackWidth > 0 && options.length > 0) {
      const segW = trackWidth / options.length;
      thumbX.value = withSpring(index * segW, SPRING_CONFIGS.snappy);
    }
  }, [index, trackWidth, options.length, thumbX]);

  const onTrackLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const select = (next: T, i: number) => {
    if (next === value) return;
    triggerHaptic('light');
    onChange(next);
    if (trackWidth > 0) {
      const segW = trackWidth / options.length;
      thumbX.value = withSpring(i * segW, SPRING_CONFIGS.snappy);
    }
  };

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: thumbX.value }],
  }));

  const segW = trackWidth > 0 ? trackWidth / options.length : 0;

  return (
    <IosGlassSurface variant="glass" radius={IOS_GLASS.radiusPill} padding={4} shadow="none">
      <View style={styles.track} onLayout={onTrackLayout}>
        {segW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.thumb,
              {
                width: segW - 4,
                backgroundColor: isTinted ? COLORS.primaryLight : 'rgba(107,191,123,0.22)',
                borderColor: isTinted ? COLORS.primary : 'rgba(107,191,123,0.45)',
              },
              thumbStyle,
            ]}
          />
        ) : null}
        {options.map((opt, i) => (
          <Pressable
            key={opt.value}
            onPress={() => select(opt.value, i)}
            style={styles.segment}
            accessibilityRole="button"
            accessibilityState={{ selected: value === opt.value }}
          >
            <Text
              style={{
                fontFamily: value === opt.value ? FONTS.bold : FONTS.medium,
                fontSize: 13,
                color: value === opt.value ? COLORS.primary : COLORS.inkMuted,
              }}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </IosGlassSurface>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    position: 'relative',
    minHeight: 40,
  },
  thumb: {
    position: 'absolute',
    top: 2,
    left: 2,
    bottom: 2,
    borderRadius: IOS_GLASS.radiusPill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    zIndex: 1,
  },
});
