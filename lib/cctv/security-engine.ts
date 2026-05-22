/**
 * CCTV security — human intrusion, unauthorized presence, camera offline.
 */

import type { BoundingBox } from '@/types/domain';

export interface SecurityEvent {
  id: string;
  kind: 'intrusion' | 'human_detected' | 'camera_offline' | 'predator' | 'theft_risk';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: number;
  cameraId?: string;
  humanCount: number;
}

export function evaluateFrameSecurity(
  boxes: BoundingBox[],
  opts: {
    cameraId: string;
    authorizedWorkersExpected?: boolean;
    nightMode?: boolean;
  },
): SecurityEvent[] {
  const events: SecurityEvent[] = [];
  const humans = boxes.filter((b) => b.class === 'human');
  const now = Date.now();

  if (humans.length > 0) {
    events.push({
      id: `human-${now}`,
      kind: 'human_detected',
      title: 'Human in frame',
      message: `${humans.length} person(s) detected — excluded from animal count.`,
      severity: 'info',
      timestamp: now,
      cameraId: opts.cameraId,
      humanCount: humans.length,
    });

    if (!opts.authorizedWorkersExpected || opts.nightMode) {
      events.push({
        id: `intrusion-${now}`,
        kind: 'intrusion',
        title: opts.nightMode ? 'Night motion — verify identity' : 'Unauthorized presence',
        message: 'Unknown human activity — review CCTV immediately.',
        severity: opts.nightMode ? 'critical' : 'warning',
        timestamp: now,
        cameraId: opts.cameraId,
        humanCount: humans.length,
      });
    }
  }

  return events;
}

export function cameraOfflineEvent(cameraId: string, cameraName: string): SecurityEvent {
  return {
    id: `offline-${cameraId}-${Date.now()}`,
    kind: 'camera_offline',
    title: 'Camera offline',
    message: `${cameraName} is not streaming. Check power and network.`,
    severity: 'warning',
    timestamp: Date.now(),
    cameraId,
    humanCount: 0,
  };
}
