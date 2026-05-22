import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { ScanModeCard } from '@/components/neo3d/scan-mode-card';
import type { FarmModule } from '@/lib/operations/modules';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { useScreenInsets } from '@/hooks/useScreenInsets';

interface ModuleGridProps {
  modules: FarmModule[];
  columns?: 1 | 2;
}

export function ModuleGrid({ modules, columns = 2 }: ModuleGridProps) {
  const router = useRouter();
  const { width, isNarrow } = useBreakpoint();
  const { horizontal } = useScreenInsets(true);
  const singleCol = columns === 1 || isNarrow;
  const gap = 12;
  const contentWidth = width - horizontal * 2;
  const cardW = singleCol ? contentWidth : (contentWidth - gap) / 2;

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
      {modules.map((m) => {
        const Icon = m.icon;
        return (
          <View key={m.id} style={{ width: cardW }}>
            <ScanModeCard
              wide
              icon={<Icon size={22} color={m.color} />}
              title={m.title}
              subtitle={m.description}
              meta=""
              glowColor={m.color}
              onPress={() => router.push(m.href)}
            />
          </View>
        );
      })}
    </View>
  );
}
