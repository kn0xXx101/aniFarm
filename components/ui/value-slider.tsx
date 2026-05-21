import { View, StyleSheet } from 'react-native';
import RNSlider from '@react-native-community/slider';

import { Text } from '@/components/ui/text';
import { IosGlassSurface } from '@/components/ui/ios-glass-surface';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';
import { triggerHaptic } from '@/lib/animations';

interface ValueSliderProps {
  label?: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  variant?: 'dark' | 'light';
  showValue?: boolean;
  /** Tighter padding for live-count dock on small phones */
  compact?: boolean;
}

/**
 * iOS-style value slider with glass track container.
 */
export function ValueSlider({
  label,
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
  variant = 'light',
  showValue = true,
  compact = false,
}: ValueSliderProps) {
  const isDark = variant === 'dark';
  const ink = isDark ? COLORS.inkSecondary : COLORS.inkMuted;
  const display = value.toLocaleString();
  const pad = compact ? 8 : 12;
  const valueSize = compact ? 17 : 20;
  const labelSize = compact ? 13 : 14;

  return (
    <IosGlassSurface
      variant={isDark ? 'glass' : 'glass'}
      radius={compact ? IOS_GLASS.radiusSm : IOS_GLASS.radiusMd}
      padding={pad}
      shadow="none"
      style={isDark ? { backgroundColor: 'rgba(0,0,0,0.35)' } : undefined}
    >
      <View style={[styles.header, compact && styles.headerCompact]}>
        {label ? (
          <Text
            style={{ fontFamily: FONTS.medium, color: ink, fontSize: labelSize, flex: 1 }}
            numberOfLines={1}
          >
            {label}
          </Text>
        ) : (
          <View />
        )}
        {showValue ? (
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: valueSize }}>{display}</Text>
        ) : null}
      </View>
      <RNSlider
        style={[styles.slider, compact && styles.sliderCompact]}
        minimumValue={min}
        maximumValue={max}
        step={step}
        value={Math.min(max, Math.max(min, value))}
        onValueChange={onChange}
        onSlidingComplete={() => triggerHaptic('light')}
        minimumTrackTintColor={COLORS.primary}
        maximumTrackTintColor={isDark ? 'rgba(255,255,255,0.15)' : COLORS.borderSoft}
        thumbTintColor={COLORS.primary}
      />
      <View style={styles.labels}>
        <Text style={{ fontFamily: FONTS.medium, fontSize: 12, lineHeight: 16, color: ink }}>{min}</Text>
        <Text style={{ fontFamily: FONTS.medium, fontSize: 12, lineHeight: 16, color: ink }}>{max}</Text>
      </View>
    </IosGlassSurface>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
    gap: 8,
  },
  headerCompact: {
    marginBottom: 0,
  },
  slider: {
    width: '100%',
    height: 36,
  },
  sliderCompact: {
    height: 28,
    marginVertical: -2,
  },
  labels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -4,
  },
});
