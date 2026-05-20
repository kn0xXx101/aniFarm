import { Text, View } from 'react-native';

import { COLORS, FONTS } from '@/lib/design-system';

interface CountSectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function CountSectionHeading({ eyebrow, title, description }: CountSectionHeadingProps) {
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
      <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 20 }}>{title}</Text>
      {description ? (
        <Text style={{ color: COLORS.inkMuted, fontSize: 14, marginTop: 4, lineHeight: 20 }}>{description}</Text>
      ) : null}
    </View>
  );
}
