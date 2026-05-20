import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS } from '@/lib/design-system';

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ eyebrow, title, description, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View className="mb-4">
      {eyebrow ? (
        <Text
          size="xs"
          className="uppercase tracking-widest font-semibold mb-1"
          style={{ color: COLORS.primary, fontFamily: 'PlusJakartaSans_600SemiBold' }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Text
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: 'PlusJakartaSans_700Bold' }}
          >
            {title}
          </Text>
          {description ? (
            <Text variant="muted" size="sm" className="mt-1 leading-5">
              {description}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} className="min-h-[44px] justify-center px-1">
            <Text className="text-primary font-semibold text-sm" style={{ fontFamily: 'PlusJakartaSans_600SemiBold' }}>
              {actionLabel}
            </Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
