import type { ReactNode } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '@/components/ui/text';
import { BadgePill } from '@/components/edu/badge-pill';
import { GRADIENTS, SHADOW } from '@/lib/design-system';

interface HeroBlockProps {
  badge: string;
  title: string;
  highlight?: string;
  subtitle: string;
  actions?: ReactNode;
}

export function HeroBlock({ badge, title, highlight, subtitle, actions }: HeroBlockProps) {
  return (
    <LinearGradient
      colors={[...GRADIENTS.hero]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[{ borderRadius: 28, padding: 24, marginBottom: 20 }, SHADOW.hero]}
    >
      <BadgePill label={badge} onDark />
      <Text
        className="text-white text-3xl font-extrabold mt-4 leading-tight"
        style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
      >
        {title}
        {highlight ? (
          <Text style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}> {highlight}</Text>
        ) : null}
      </Text>
      <Text className="text-white/90 text-base mt-3 leading-6">{subtitle}</Text>
      {actions ? <View className="mt-5 gap-3">{actions}</View> : null}
    </LinearGradient>
  );
}
