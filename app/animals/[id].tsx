import { useMemo } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { QrCode } from 'lucide-react-native';

import { OperationsScreen } from '@/components/operations/operations-screen';
import { DetailRow } from '@/components/operations/detail-row';
import { Card3D } from '@/components/ui/card-3d';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/layout/empty-state';
import { LivestockTypeIcon } from '@/components/brand/brand-icon';
import { useAnimalStore } from '@/lib/stores/animal-store';
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

export default function AnimalDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const allAnimals = useAnimalStore((s) => s.animals);
  const animal = useMemo(() => allAnimals.find((a) => a.id === id), [allAnimals, id]);

  if (!animal) {
    return (
      <OperationsScreen title="Animal" showBack requireFarm={false}>
        <EmptyState
          icon={<LivestockTypeIcon type="broiler" size={28} color={COLORS.primary} strokeWidth={2} />}
          title="Animal not found"
          description="This record may have been removed or the link is invalid."
          actionLabel="Back to registry"
          onAction={() => router.replace('/animals')}
        />
      </OperationsScreen>
    );
  }

  return (
    <OperationsScreen title={animal.name} subtitle={animal.tagId} requireFarm={false}>
      <Card3D variant="neon" glowColor={COLORS.primary} style={{ marginBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: COLORS.primaryLight,
            }}
          >
            <QrCode size={32} color={COLORS.primary} />
          </View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontFamily: FONTS.bold, color: COLORS.ink, fontSize: 18 }}>{animal.tagId}</Text>
            <Text style={{ color: COLORS.inkMuted, marginTop: 4 }}>Field ID · QR ready</Text>
          </View>
        </View>
      </Card3D>

      <Card3D variant="glass">
        <DetailRow label="Species" value={SPECIES_LABEL[animal.species]} />
        <DetailRow label="Health" value={animal.healthStatus.replace('_', ' ')} />
        <DetailRow label="Vaccination" value={animal.vaccinationStatus} />
        {animal.breed ? <DetailRow label="Breed" value={animal.breed} /> : null}
        {animal.gender !== 'unknown' ? <DetailRow label="Gender" value={animal.gender} /> : null}
        {animal.weightKg != null ? <DetailRow label="Weight" value={`${animal.weightKg} kg`} /> : null}
        {animal.rfid ? <DetailRow label="RFID" value={animal.rfid} /> : null}
        {animal.notes ? (
          <DetailRow label="Notes" value={animal.notes} last />
        ) : (
          <DetailRow label="Status" value="No notes" last />
        )}
        <View
          style={{
            marginTop: 4,
            alignSelf: 'flex-start',
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 8,
            backgroundColor: COLORS.primaryLight,
          }}
        >
          <Text style={{ fontFamily: FONTS.semibold, fontSize: 11, color: HEALTH_COLOR[animal.healthStatus] }}>
            {animal.healthStatus.toUpperCase()}
          </Text>
        </View>
      </Card3D>

      <Button variant="outline" onPress={() => router.replace('/animals')} style={{ marginTop: 16, width: '100%' }}>
        <Text>Back to list</Text>
      </Button>
    </OperationsScreen>
  );
}
