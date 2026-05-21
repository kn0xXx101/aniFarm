import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, TYPE } from '@/lib/design-system';

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
        <Text style={[TYPE.eyebrow, { textTransform: 'uppercase', marginBottom: 4 }]}>{eyebrow}</Text>
      ) : null}
      <View className="flex-row items-end justify-between gap-3">
        <View className="flex-1">
          <Text style={TYPE.title}>{title}</Text>
          {description ? (
            <Text variant="muted" size="sm" className="mt-1" style={{ lineHeight: 20 }}>
              {description}
            </Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} className="min-h-[44px] justify-center px-1">
            <Text style={[TYPE.label, { color: COLORS.primary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
