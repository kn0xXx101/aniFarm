import { View, Text, StyleSheet } from 'react-native';

import { DETECTION_CLASS_LABELS } from '@/lib/livestock';
import { COLORS, FONTS } from '@/lib/design-system';

interface DetectionSummaryProps {
  aliveCount: number;
  deadCount: number;
  excludedHumans: number;
  variant?: 'dark' | 'light' | 'compact';
}

export function DetectionSummary({
  aliveCount,
  deadCount,
  excludedHumans,
  variant = 'light',
}: DetectionSummaryProps) {
  const compact = variant === 'compact';
  const dark = variant === 'dark' || compact;

  const items = [
    { key: 'alive', value: aliveCount, color: COLORS.primary, label: DETECTION_CLASS_LABELS.livestock_alive },
    { key: 'dead', value: deadCount, color: COLORS.danger, label: DETECTION_CLASS_LABELS.livestock_dead },
    {
      key: 'human',
      value: excludedHumans,
      color: COLORS.inkMuted,
      label: DETECTION_CLASS_LABELS.human,
    },
  ] as const;

  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {items.map((item) => (
        <View
          key={item.key}
          style={[
            styles.chip,
            compact && styles.chipCompact,
            dark && styles.chipDark,
          ]}
        >
          <Text
            style={[
              styles.value,
              compact && styles.valueCompact,
              { color: item.color },
            ]}
          >
            {item.value}
          </Text>
          <Text style={[styles.label, dark && styles.labelDark]} numberOfLines={1}>
            {compact ? item.label.split(' ')[0] : item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  rowCompact: {
    gap: 6,
  },
  chip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
    backgroundColor: COLORS.surfaceMuted,
    borderWidth: 1,
    borderColor: COLORS.borderSoft,
  },
  chipCompact: {
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  chipDark: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  value: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    lineHeight: 22,
  },
  valueCompact: {
    fontSize: 16,
    lineHeight: 20,
  },
  label: {
    fontFamily: FONTS.medium,
    fontSize: 10,
    color: COLORS.inkMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  labelDark: {
    color: 'rgba(255,255,255,0.55)',
  },
});
