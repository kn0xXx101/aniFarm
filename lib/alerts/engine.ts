/**
 * Evaluates operational rules after counts and house updates.
 */

import type { PoultryHouse } from '@/types/domain';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useSettingsStore } from '@/lib/stores/settings-store';

export interface EvaluateHouseAlertsInput {
  farmId: string;
  house: PoultryHouse;
  /** Optional label for alert copy */
  farmName?: string;
}

/**
 * Run threshold checks for a house. Call after saving a count or editing mortality.
 */
export function evaluateHouseAlerts({ farmId, house, farmName }: EvaluateHouseAlertsInput): void {
  const settings = useSettingsStore.getState();
  const addAlert = useAlertStore.getState().addAlert;

  const capacityPct = house.capacity > 0 ? Math.round((house.currentCount / house.capacity) * 100) : 0;
  const location = farmName ? `${farmName} · ${house.name}` : house.name;

  if (house.mortality7d >= settings.mortalityThreshold) {
    addAlert({
      farmId,
      kind: 'mortality',
      severity: house.mortality7d >= settings.mortalityThreshold * 1.5 ? 'critical' : 'warning',
      title: 'Mortality above threshold',
      message: `${house.mortality7d} birds in 7d at ${location} (limit: ${settings.mortalityThreshold}).`,
    });
  }

  // densityThreshold used as capacity % proxy until floor area exists on house model
  if (capacityPct >= settings.densityThreshold) {
    addAlert({
      farmId,
      kind: 'overcrowding',
      severity: capacityPct >= 95 ? 'critical' : 'warning',
      title: 'Capacity above threshold',
      message: `${location} is at ${capacityPct}% capacity (threshold: ${settings.densityThreshold}%).`,
    });
  }
}
