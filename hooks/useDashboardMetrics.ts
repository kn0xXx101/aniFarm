import { useMemo } from 'react';

import { useAnimalStore } from '@/lib/stores/animal-store';
import { useOperationsStore } from '@/lib/stores/operations-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import { useSessionStore } from '@/lib/stores/session-store';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useCctvStore } from '@/lib/stores/cctv-store';

export function useDashboardMetrics(farmId?: string) {
  const animals = useAnimalStore((s) => s.animals);
  const speciesCounts = useAnimalStore((s) => s.speciesCounts);
  const houses = useFarmStore((s) => s.houses);
  const sessions = useSessionStore((s) => s.sessions);
  const alerts = useAlertStore((s) => s.alerts);
  const feeds = useCctvStore((s) => s.feeds);
  const runtime = useCctvStore((s) => s.runtime);

  const pendingTasks = useOperationsStore((s) => s.pendingTasks);
  const feedLow = useOperationsStore((s) => s.feedLowCount);
  const vacDue = useOperationsStore((s) => s.vaccinationsDue);
  const revenue = useOperationsStore((s) => s.totalRevenue);

  return useMemo(() => {
    const farmAnimals = farmId ? animals.filter((a) => a.farmId === farmId) : animals;
    const aliveRegistry = farmAnimals.filter((a) => a.healthStatus !== 'dead').length;
    const sick = farmAnimals.filter((a) => a.healthStatus === 'sick').length;
    const deadAlerts = alerts.filter(
      (a) =>
        !a.read &&
        (a.kind === 'mortality_detected' || a.kind === 'dead_suspected' || a.kind === 'mortality'),
    ).length;
    const securityAlerts = alerts.filter(
      (a) => !a.read && (a.kind === 'intrusion' || a.kind === 'system'),
    ).length;
    const farmHouses = farmId ? houses.filter((h) => h.farmId === farmId) : houses;
    const penAlive = farmHouses.reduce((s, h) => s + h.currentCount, 0);
    const lastSession = sessions.find((s) => !farmId || s.farmId === farmId);
    const cctvOnline = feeds.filter((f) => {
      const r = runtime[f.id];
      return r?.status === 'online';
    }).length;

    return {
      totalAnimals: aliveRegistry || penAlive,
      penAlive,
      speciesCounts: speciesCounts(farmId),
      liveAiCount: lastSession?.aliveCount ?? lastSession?.count ?? 0,
      deadAlerts,
      sickAlerts: sick,
      cctvOnline,
      cctvTotal: feeds.length,
      feedLow: feedLow(farmId),
      vaccinationsDue: vacDue(farmId),
      revenue: revenue(farmId),
      pendingTasks: pendingTasks(farmId),
      securityAlerts,
      unreadAlerts: alerts.filter((a) => !a.read).length,
    };
  }, [
    animals,
    farmId,
    speciesCounts,
    houses,
    sessions,
    alerts,
    feeds,
    runtime,
    pendingTasks,
    feedLow,
    vacDue,
    revenue,
  ]);
}
