/**
 * Evaluates operational rules after counts and house updates.
 * Fires both in-app alerts and local push notifications for threshold breaches.
 */

import type { PoultryHouse } from '@/types/domain';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { scheduleLocalAlert } from '@/lib/notifications';

export interface EvaluateHouseAlertsInput {
  farmId: string;
  house: PoultryHouse;
  /** Optional label for alert copy */
  farmName?: string;
}

/**
 * Run threshold checks for a house. Call after saving a count or editing mortality.
 * Adds in-app alerts and schedules local push notifications when push is enabled.
 */
export function evaluateHouseAlerts({ farmId, house, farmName }: EvaluateHouseAlertsInput): void {
  const settings = useSettingsStore.getState();
  const addAlert = useAlertStore.getState().addAlert;

  const capacityPct = house.capacity > 0 ? Math.round((house.currentCount / house.capacity) * 100) : 0;
  const location = farmName ? `${farmName} · ${house.name}` : house.name;

  if (house.mortality7d >= settings.mortalityThreshold) {
    const severity = house.mortality7d >= settings.mortalityThreshold * 1.5 ? 'critical' : 'warning';
    const title = 'Mortality above threshold';
    const message = `${house.mortality7d} birds in 7d at ${location} (limit: ${settings.mortalityThreshold}).`;
    addAlert({ farmId, kind: 'mortality', severity, title, message });
    if (settings.pushEnabled) {
      void scheduleLocalAlert(title, message);
    }
  }

  // densityThreshold used as capacity % proxy until floor area exists on house model
  if (capacityPct >= settings.densityThreshold) {
    const severity = capacityPct >= 95 ? 'critical' : 'warning';
    const title = 'Capacity above threshold';
    const message = `${location} is at ${capacityPct}% capacity (threshold: ${settings.densityThreshold}%).`;
    addAlert({ farmId, kind: 'overcrowding', severity, title, message });
    if (settings.pushEnabled) {
      void scheduleLocalAlert(title, message);
    }
  }
}
