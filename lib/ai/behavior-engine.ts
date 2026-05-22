/**
 * Dead / sick animal suspicion from tracking history (CCTV + live count).
 */

import type { TrackedAnimal } from '@/lib/ai/counting-service';
import type { AlertSeverity } from '@/types/domain';

export interface BehaviorAlert {
  trackId: number;
  kind: 'dead_suspected' | 'sick_suspected' | 'isolated' | 'no_movement';
  severity: AlertSeverity;
  title: string;
  message: string;
  stationaryMs: number;
}

const DEAD_STATIONARY_MS = 45_000;
const SICK_STATIONARY_MS = 25_000;

export function analyzeTracks(
  tracks: TrackedAnimal[],
  now: number,
  opts?: { abnormalPosture?: boolean; isolated?: boolean },
): BehaviorAlert[] {
  const alerts: BehaviorAlert[] = [];

  for (const t of tracks) {
    const stationaryMs = now - t.lastSeenAt;
    const duration = t.lastSeenAt - t.firstSeenAt;

    if (duration > DEAD_STATIONARY_MS && stationaryMs < 500) {
      alerts.push({
        trackId: t.trackId,
        kind: 'dead_suspected',
        severity: 'critical',
        title: 'Dead animal suspected',
        message: `Track #${t.trackId} motionless > ${Math.round(DEAD_STATIONARY_MS / 1000)}s with abnormal stillness.`,
        stationaryMs: duration,
      });
      continue;
    }

    if (duration > SICK_STATIONARY_MS && opts?.abnormalPosture) {
      alerts.push({
        trackId: t.trackId,
        kind: 'sick_suspected',
        severity: 'warning',
        title: 'Sick behavior suspected',
        message: `Track #${t.trackId} weak motion / abnormal posture.`,
        stationaryMs: duration,
      });
    }

    if (opts?.isolated && duration > 20_000) {
      alerts.push({
        trackId: t.trackId,
        kind: 'isolated',
        severity: 'warning',
        title: 'Isolated animal',
        message: `Track #${t.trackId} separated from herd — inspect welfare.`,
        stationaryMs: duration,
      });
    }
  }

  return alerts;
}
