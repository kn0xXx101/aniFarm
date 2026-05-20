import { useCallback, useEffect, useState } from 'react';
import { LayoutChangeEvent, Pressable, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { Text } from '@/components/ui/text';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import {
  getSliderLabelColor,
  getSliderThumbColors,
  iosSliderStyles,
  IOS_SLIDER,
} from '@/lib/ios-slider-style';
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
 * iOS 26 segmented control — glass track with sliding thumb between options.
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

  const thumbColors = getSliderThumbColors('primary', isTinted);
  const segW = trackWidth > 0 ? trackWidth / options.length : 0;

  return (
    <IosGlassSurface variant="glass" radius={IOS_GLASS.radiusPill} padding={IOS_SLIDER.trackPadding} shadow="none">
      <View style={iosSliderStyles.track} onLayout={onTrackLayout}>
        {segW > 0 ? (
          <Animated.View
            pointerEvents="none"
            style={[
              iosSliderStyles.thumb,
              { width: segW - IOS_SLIDER.thumbInset * 2 },
              thumbColors,
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
                fontSize: IOS_SLIDER.labelSize,
                color: getSliderLabelColor('primary', value === opt.value),
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
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    zIndex: 1,
  },
});
