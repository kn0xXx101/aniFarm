import { Pressable, View } from 'react-native';

import { Text } from '@/components/ui/text';
import { COLORS, FONTS } from '@/lib/design-system';

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
        <Text
          style={{
            fontFamily: FONTS.semibold,
            color: COLORS.primary,
            fontSize: 11,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 4,
          }}
        >
          {eyebrow}
        </Text>
      ) : null}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 20 }}>{title}</Text>
          {description ? (
            <Text style={{ color: COLORS.inkMuted, fontSize: 14, marginTop: 4, lineHeight: 20 }}>{description}</Text>
          ) : null}
        </View>
        {actionLabel && onAction ? (
          <Pressable onPress={onAction} hitSlop={8}>
            <Text style={{ fontFamily: FONTS.semibold, color: COLORS.secondary, fontSize: 14 }}>{actionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
