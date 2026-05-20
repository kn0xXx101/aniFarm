import { Pressable, Text, View } from 'react-native';

import { COLORS, FONTS } from '@/lib/design-system';

interface CountAdjustBarProps {
  value: number;
  onChange: (next: number) => void;
  label?: string;
  min?: number;
  step?: number;
  variant?: 'dark' | 'light';
}

export function CountAdjustBar({
  value,
  onChange,
  label = 'Adjust count',
  min = 0,
  step = 1,
  variant = 'light',
}: CountAdjustBarProps) {
  const isDark = variant === 'dark';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: isDark ? COLORS.border : COLORS.borderSoft,
        backgroundColor: isDark ? 'rgba(0,0,0,0.45)' : COLORS.surfaceMuted,
      }}
    >
      <Text style={{ fontFamily: FONTS.medium, color: isDark ? COLORS.inkSecondary : COLORS.inkMuted, fontSize: 13 }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => onChange(Math.max(min, value - step))}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.surface,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          accessibilityLabel="Decrease count"
        >
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 18 }}>−</Text>
        </Pressable>
        <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 22, minWidth: 56, textAlign: 'center' }}>
          {value.toLocaleString()}
        </Text>
        <Pressable
          onPress={() => onChange(value + step)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: COLORS.primaryLight,
            borderWidth: 1,
            borderColor: COLORS.border,
          }}
          accessibilityLabel="Increase count"
        >
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.primary, fontSize: 18 }}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
