import { Pressable, Text, View } from 'react-native';

import { COLORS, FONTS } from '@/lib/design-system';

interface HouseOption {
  id: string;
  name: string;
}

interface HousePickerProps {
  houses: HouseOption[];
  value?: string;
  onChange: (id: string) => void;
  label?: string;
  variant?: 'dark' | 'light';
  /** Single row for horizontal scroll parents (live count). */
  layout?: 'wrap' | 'row';
}

export function HousePicker({
  houses,
  value,
  onChange,
  label = 'House',
  variant = 'light',
  layout = 'wrap',
}: HousePickerProps) {
  const isDark = variant === 'dark';

  return (
    <View>
      {label ? (
        <Text
          style={{
            fontFamily: FONTS.semibold,
            fontSize: 12,
            lineHeight: 16,
            textTransform: 'uppercase',
            letterSpacing: 1,
            color: isDark ? 'rgba(255,255,255,0.7)' : COLORS.inkMuted,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: layout === 'row' ? 'nowrap' : 'wrap', gap: 8 }}>
        {houses.map((h) => {
          const active = value === h.id;
          return (
            <Pressable
              key={h.id}
              onPress={() => onChange(h.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                minHeight: 36,
                justifyContent: 'center',
                borderWidth: 1,
                borderColor: active ? COLORS.primary : isDark ? 'rgba(255,255,255,0.25)' : COLORS.borderSoft,
                backgroundColor: active ? COLORS.primaryLight : isDark ? 'rgba(0,0,0,0.4)' : COLORS.surfaceMuted,
              }}
            >
              <Text style={{ fontFamily: FONTS.semibold, color: active ? COLORS.primary : isDark ? '#fff' : COLORS.ink }}>
                {h.name}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
