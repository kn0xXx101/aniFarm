/**
 * CCTV live counting engine (mock / client-side until backend worker is live).
 *
 * Uses the same multi-class detector as manual counts:
 * - livestock_alive → operational count (smoothed for stable CCTV totals)
 * - livestock_dead → welfare alerts
 * - human → detected but excluded from totals
 */

import { generateStreamFrame } from '@/lib/ai/counting-service';
import type { CctvCountUpdate } from '@/types/domain';

interface FeedRuntime {
  tick: number;
  smoothedAlive: number;
  target: number;
}

const runtimeByFeed = new Map<string, FeedRuntime>();

function targetForFeed(feedId: string): number {
  let h = 0;
  for (let i = 0; i < feedId.length; i++) h = (h + feedId.charCodeAt(i)) | 0;
  return 55 + (Math.abs(h) % 80);
}

function getRuntime(feedId: string): FeedRuntime {
  const existing = runtimeByFeed.get(feedId);
  if (existing) return existing;
  const target = targetForFeed(feedId);
  const created: FeedRuntime = { tick: 0, smoothedAlive: target, target };
  runtimeByFeed.set(feedId, created);
  return created;
}

/**
 * Produce one CCTV count update — stable alive total, real dead/human flags from detector.
 */
export function simulateCctvDetection(feedId: string): CctvCountUpdate {
  const rt = getRuntime(feedId);
  rt.tick += 1;
  const frame = generateStreamFrame(rt.tick + rt.target, rt.target);

  rt.smoothedAlive = Math.round(rt.smoothedAlive * 0.65 + frame.aliveCount * 0.35);

  return {
    feedId,
    count: rt.smoothedAlive,
    aliveCount: rt.smoothedAlive,
    deadCount: frame.deadCount,
    excludedHumans: frame.excludedHumans,
    avgConfidence: frame.avgConfidence,
    countedAt: Date.now(),
    boxes: frame.boxes,
  };
}

export function resetCctvSimulation(feedId: string): void {
  runtimeByFeed.delete(feedId);
}
