import { useMemo } from 'react';

import { useFarmStore } from '@/lib/stores/farm-store';

export function useActiveFarm() {
  const farms = useFarmStore((s) => s.farms);
  const selectedFarmId = useFarmStore((s) => s.selectedFarmId);
  const farmId = selectedFarmId ?? farms[0]?.id;
  const farm = useMemo(() => farms.find((f) => f.id === farmId), [farms, farmId]);

  return {
    farms,
    farmId,
    farm,
    hasFarm: farms.length > 0 && !!farmId,
  };
}
