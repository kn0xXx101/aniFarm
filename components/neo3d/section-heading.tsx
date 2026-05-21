import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, TYPE } from '@/lib/design-system';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeading({ eyebrow, title, description, actionLabel, onAction }: SectionHeadingProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      {eyebrow ? (
        <Text style={[TYPE.eyebrow, { textTransform: 'uppercase', marginBottom: 4 }]}>{eyebrow}</Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={TYPE.title}>{title}</Text>
          {description ? (
            <Text style={[TYPE.bodySecondary, { marginTop: 4 }]}>{description}</Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={[TYPE.label, { color: COLORS.secondary }]}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
