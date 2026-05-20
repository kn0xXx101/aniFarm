import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS } from '@/lib/design-system';

interface Feature {
  icon: ReactNode;
  title: string;
  body: string;
}

export function FeatureGrid({ features }: { features: Feature[] }) {
  return (
    <View className="flex-row flex-wrap gap-3">
      {features.map((f) => (
        <SurfaceCard key={f.title} className="w-[48%] flex-grow" style={{ minWidth: '46%' }}>
          <View
            className="size-10 rounded-xl items-center justify-center mb-3"
            style={{ backgroundColor: COLORS.primaryLight }}
          >
            {f.icon}
          </View>
          <Text className="font-bold text-sm" style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
            {f.title}
          </Text>
          <Text variant="muted" size="xs" className="mt-1 leading-4">
            {f.body}
          </Text>
        </SurfaceCard>
      ))}
    </View>
  );
}
