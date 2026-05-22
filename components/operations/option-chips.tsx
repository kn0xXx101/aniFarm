import { Pressable, ScrollView, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';
import { IOS_GLASS } from '@/lib/ios-glass';

interface OptionChipsProps<T extends string> {
  label?: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}

export function OptionChips<T extends string>({ label, options, value, onChange }: OptionChipsProps<T>) {
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <Text style={{ fontFamily: FONTS.semibold, fontSize: 12, color: COLORS.inkMuted }}>{label}</Text>
      ) : null}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
        {options.map((o) => {
          const active = o.value === value;
          return (
            <Pressable
              key={o.value}
              onPress={() => onChange(o.value)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: IOS_GLASS.radiusPill,
                backgroundColor: active ? COLORS.primaryLight : IOS_GLASS.tintFill,
                borderWidth: 1,
                borderColor: active ? COLORS.primary : COLORS.borderSoft,
              }}
            >
              <Text
                style={{
                  fontFamily: FONTS.semibold,
                  fontSize: 13,
                  color: active ? COLORS.primary : COLORS.inkMuted,
                }}
              >
                {o.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
