import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { SurfaceCard } from '@/components/ui/surface-card';
import { COLORS } from '@/lib/design-system';

interface StatItem {
  value: string;
  label: string;
}

export function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <View className="flex-row gap-3 mb-2">
      {items.map((item) => (
        <SurfaceCard key={item.label} className="flex-1 items-center py-4" padded>
          <Text
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: 'PlusJakartaSans_800ExtraBold' }}
          >
            {item.value}
          </Text>
          <Text variant="muted" size="xs" className="mt-1 text-center" style={{ fontFamily: 'PlusJakartaSans_500Medium' }}>
            {item.label}
          </Text>
        </SurfaceCard>
      ))}
    </View>
  );
}
