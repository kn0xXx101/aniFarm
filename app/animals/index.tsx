import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { OpsSection } from '@/components/operations/ops-section';
import { Card3D } from '@/components/ui/card-3d';
import { CountPillButton } from '@/components/count/count-pill-button';
import { Text } from '@/components/ui/text';
import { EmptyState } from '@/components/layout/empty-state';
import { FarmIcon } from '@/components/brand/brand-icon';
import { useAnimalStore } from '@/lib/stores/animal-store';
import { useMemo } from 'react';
import { useActiveFarm } from '@/hooks/useActiveFarm';
import { COLORS, FONTS } from '@/lib/design-system';
import type { AnimalHealthStatus, AnimalSpecies } from '@/types/domain';

const SPECIES_LABEL: Record<AnimalSpecies, string> = {
  chicken: 'Chicken',
  duck: 'Duck',
  turkey: 'Turkey',
  pig: 'Pig',
  goat: 'Goat',
  sheep: 'Sheep',
  cow: 'Cattle',
  rabbit: 'Rabbit',
  fish: 'Fish',
  mixed: 'Mixed',
};

const HEALTH_COLOR: Record<AnimalHealthStatus, string> = {
  healthy: COLORS.primary,
  sick: COLORS.danger,
  dead: COLORS.danger,
  quarantine: COLORS.warning,
};

export default function AnimalsScreen() {
  const router = useRouter();
  const { farmId } = useActiveFarm();
  const allAnimals = useAnimalStore((s) => s.animals);
  const animals = useMemo(
    () => (farmId ? allAnimals.filter((a) => a.farmId === farmId) : allAnimals),
    [allAnimals, farmId],
  );

  return (
    <OperationsScreen title="Animals" subtitle="Registry · RFID · QR tags">
      <CountPillButton
        label="Register animal"
        icon={Plus}
        onPress={() => router.push('/animals/new')}
        style={{ width: '100%', marginBottom: 4 }}
        size="lg"
      />

      {animals.length === 0 ? (
        <EmptyState
          icon={<FarmIcon size={28} color={COLORS.primary} strokeWidth={2} />}
          title="No animals registered"
          description="Add individual animals or import a batch for the active farm."
          actionLabel="Register first animal"
          onAction={() => router.push('/animals/new')}
        />
      ) : (
        <OpsSection eyebrow="Herd" title={`${animals.length} registered`} topGap={12}>
          {animals.map((a) => (
            <Card3D
              key={a.id}
              variant="glass"
              style={{ marginBottom: 10 }}
              onPress={() => router.push({ pathname: '/animals/[id]', params: { id: a.id } })}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 16 }} numberOfLines={1}>
                    {a.name}
                  </Text>
                  <Text style={{ color: COLORS.inkMuted, fontSize: 13, marginTop: 2 }}>
                    {SPECIES_LABEL[a.species]} · {a.tagId}
                  </Text>
                  {a.rfid ? (
                    <Text style={{ color: COLORS.secondary, fontSize: 12, marginTop: 4 }}>RFID {a.rfid}</Text>
                  ) : null}
                </View>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 8,
                    backgroundColor: COLORS.primaryLight,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.semibold,
                      fontSize: 11,
                      color: HEALTH_COLOR[a.healthStatus],
                    }}
                  >
                    {a.healthStatus.toUpperCase()}
                  </Text>
                </View>
              </View>
            </Card3D>
          ))}
        </OpsSection>
      )}
    </OperationsScreen>
  );
}
