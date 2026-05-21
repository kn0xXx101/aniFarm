import { Text, View } from 'react-native';

import { COLORS, TYPE } from '@/lib/design-system';

interface CountSectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function CountSectionHeading({ eyebrow, title, description }: CountSectionHeadingProps) {
  return (
    <View style={{ marginBottom: 14 }}>
      {eyebrow ? (
        <Text style={[TYPE.eyebrow, { textTransform: 'uppercase', marginBottom: 4 }]}>{eyebrow}</Text>
      ) : null}
      <Text style={TYPE.title}>{title}</Text>
      {description ? (
        <Text style={[TYPE.bodySecondary, { marginTop: 4 }]}>{description}</Text>
      ) : null}
    </View>
  );
}
