/**
 * Evaluates operational rules after counts and pen updates.
 */

import type { LivestockPen } from '@/types/domain';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { scheduleLocalAlert } from '@/lib/notifications';
import { canUseFeature } from '@/lib/subscription/service';

export interface EvaluateHouseAlertsInput {
  farmId: string;
  house: LivestockPen;
  farmName?: string;
  /** Dead animals detected in the latest AI pass */
  deadDetected?: number;
}

export function evaluateHouseAlerts({
  farmId,
  house,
  farmName,
  deadDetected = 0,
}: EvaluateHouseAlertsInput): void {
  if (!canUseFeature('ai_alerts').ok) return;

  const settings = useSettingsStore.getState();
  const addAlert = useAlertStore.getState().addAlert;

  const capacityPct = house.capacity > 0 ? Math.round((house.currentCount / house.capacity) * 100) : 0;
  const location = farmName ? `${farmName} · ${house.name}` : house.name;

  if (house.mortality7d >= settings.mortalityThreshold) {
    const severity = house.mortality7d >= settings.mortalityThreshold * 1.5 ? 'critical' : 'warning';
    const title = 'Mortality above threshold';
    const message = `${house.mortality7d} losses in 7d at ${location} (limit: ${settings.mortalityThreshold}).`;
    addAlert({ farmId, kind: 'mortality', severity, title, message });
    if (settings.pushEnabled) {
      void scheduleLocalAlert(title, message);
    }
  }

  if (deadDetected >= settings.deadAlertMin) {
    const title = 'Dead animals detected';
    const message = `AI flagged ${deadDetected} deceased animal${deadDetected === 1 ? '' : 's'} at ${location}. Verify welfare and remove carcasses.`;
    addAlert({ farmId, kind: 'mortality_detected', severity: deadDetected >= 3 ? 'critical' : 'warning', title, message });
    if (settings.pushEnabled) {
      void scheduleLocalAlert(title, message);
    }
  }

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
