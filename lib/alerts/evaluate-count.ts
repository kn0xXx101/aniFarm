/**
 * Unified post-count evaluation for live, image, video, and CCTV modes.
 */

import type { CountingMode, LivestockPen } from '@/types/domain';
import { evaluateHouseAlerts } from '@/lib/alerts/engine';
import { useAlertStore } from '@/lib/stores/alert-store';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { scheduleLocalAlert } from '@/lib/notifications';

export interface CountResultSnapshot {
  farmId: string;
  farmName?: string;
  house?: LivestockPen;
  houseId?: string;
  mode: CountingMode;
  aliveCount: number;
  deadCount: number;
  excludedHumans: number;
  avgConfidence: number;
}

/**
 * Runs threshold checks and mode-specific alerts after any count completes.
 */
export function evaluateCountResult(snapshot: CountResultSnapshot): void {
  const settings = useSettingsStore.getState();
  const addAlert = useAlertStore.getState().addAlert;
  const { farmId, farmName, house, mode, aliveCount, deadCount, excludedHumans } = snapshot;

  if (house) {
    evaluateHouseAlerts({
      farmId,
      farmName,
      house: { ...house, currentCount: aliveCount, lastCountedAt: Date.now() },
      deadDetected: deadCount >= settings.deadAlertMin ? deadCount : 0,
    });
  } else if (deadCount >= settings.deadAlertMin) {
    const title = 'Dead animals detected';
    const message = `AI flagged ${deadCount} deceased animal${deadCount === 1 ? '' : 's'} (${mode} count). Staff excluded: ${excludedHumans}.`;
    addAlert({ farmId, kind: 'mortality_detected', severity: deadCount >= 3 ? 'critical' : 'warning', title, message });
    if (settings.pushEnabled) {
      void scheduleLocalAlert(title, message);
    }
  }

}
