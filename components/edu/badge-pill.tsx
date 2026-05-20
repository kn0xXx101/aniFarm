import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/design-system';

export function BadgePill({ label, onDark = false }: { label: string; onDark?: boolean }) {
  return (
    <View
      className="self-start rounded-full px-3 py-1.5 border"
      style={{
        backgroundColor: onDark ? 'rgba(255,255,255,0.2)' : COLORS.primaryLight,
        borderColor: onDark ? 'rgba(255,255,255,0.35)' : COLORS.border,
      }}
    >
      <Text
        size="xs"
        className="font-semibold"
        style={{
          color: onDark ? '#FFFFFF' : COLORS.primary,
          fontFamily: 'PlusJakartaSans_600SemiBold',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
