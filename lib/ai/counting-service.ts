/**
 * aniFarm — On-device livestock counting service.
 *
 * Detects alive and dead animals across species (poultry, cattle, sheep, goats, pigs, etc.).
 * People in frame are classified as `human` and excluded from flock totals.
 *
 * Production: YOLO / TFLite multi-class model (livestock_alive, livestock_dead, human excluded).
 * Supports all livestock species — poultry, cattle, sheep, goats, pigs, horses, fish, etc.
 * MVP: deterministic mock pipeline for Expo Go and web.
 */

import type { BoundingBox, DetectionClass } from '@/types/domain';
import { boxesForTracking, summarizeDetections } from '@/lib/livestock';

export interface DetectionResult {
  boxes: BoundingBox[];
  /** Alive animals only (primary operational count) */
  count: number;
  aliveCount: number;
  deadCount: number;
  excludedHumans: number;
  avgConfidence: number;
  inferenceMs: number;
}

export interface TrackedAnimal extends BoundingBox {
  trackId: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

/** @deprecated Use TrackedAnimal */
export type TrackedBird = TrackedAnimal;

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function makeBox(
  rng: () => number,
  id: number,
  cls: DetectionClass,
  confidenceBase: number,
): BoundingBox {
  const w = cls === 'human' ? 0.08 + rng() * 0.06 : 0.05 + rng() * 0.05;
  const h = w * (cls === 'human' ? 1.8 + rng() * 0.4 : 0.9 + rng() * 0.3);
  const x = rng() * (1 - w);
  const y = rng() * (1 - h);
  const confidence = confidenceBase + rng() * 0.22;
  return { id, x, y, w, h, confidence, class: cls };
}

function generateClassifiedBoxes(rng: () => number, aliveTarget: number): BoundingBox[] {
  const deadTarget = Math.max(0, Math.floor(aliveTarget * (0.02 + rng() * 0.04)));
  const humanTarget = rng() > 0.55 ? 1 + Math.floor(rng() * 2) : 0;
  const boxes: BoundingBox[] = [];
  let id = 0;

  for (let i = 0; i < aliveTarget; i++) {
    boxes.push(makeBox(rng, id++, 'livestock_alive', 0.72));
  }
  for (let i = 0; i < deadTarget; i++) {
    boxes.push(makeBox(rng, id++, 'livestock_dead', 0.68));
  }
  for (let i = 0; i < humanTarget; i++) {
    boxes.push(makeBox(rng, id++, 'human', 0.82));
  }

  return boxes;
}

function finalizeResult(boxes: BoundingBox[], inferenceMs: number): DetectionResult {
  const { aliveCount, deadCount, excludedHumans, count } = summarizeDetections(boxes);
  const livestock = boxes.filter((b) => b.class !== 'human');
  const avgConfidence = livestock.length
    ? livestock.reduce((s, b) => s + b.confidence, 0) / livestock.length
    : 0;

  return {
    boxes,
    count,
    aliveCount,
    deadCount,
    excludedHumans,
    avgConfidence,
    inferenceMs,
  };
}

/** Generate plausible livestock detections for an image URI. */
export function detectFromImage(uri: string, opts?: { target?: number }): DetectionResult {
  const start = Date.now();
  const rng = mulberry32(hashString(uri || 'default'));
  const aliveTarget = opts?.target ?? Math.floor(40 + rng() * 90);
  const boxes = generateClassifiedBoxes(rng, aliveTarget);
  return finalizeResult(boxes, Date.now() - start + Math.floor(80 + rng() * 80));
}

/** Streaming frame iterator for live / video counting. */
export function generateStreamFrame(tick: number, target = 78): DetectionResult {
  const rng = mulberry32(tick * 9301 + 49297);
  const drift = Math.sin(tick / 6) * 4;
  const aliveTarget = Math.max(20, Math.round(target + drift + (rng() - 0.5) * 6));
  const boxes = generateClassifiedBoxes(rng, aliveTarget);
  return finalizeResult(boxes, 28 + Math.floor(rng() * 14));
}

/** Alias used by video count and inference modules */
export const detectStreamFrame = generateStreamFrame;

/**
 * ByteTrack-style update — only `livestock_alive` boxes are tracked for unique head count.
 */
export function trackUpdate(
  prev: TrackedAnimal[],
  next: BoundingBox[],
  now: number,
  iouThreshold = 0.3,
): TrackedAnimal[] {
  const alive = boxesForTracking(next);
  const out: TrackedAnimal[] = [];
  const used = new Set<number>();

  for (const det of alive) {
    let bestIdx = -1;
    let bestIou = iouThreshold;
    for (let i = 0; i < prev.length; i++) {
      if (used.has(i)) continue;
      const iou = boxIou(det, prev[i]);
      if (iou > bestIou) {
        bestIou = iou;
        bestIdx = i;
      }
    }
    if (bestIdx >= 0) {
      const t = prev[bestIdx];
      used.add(bestIdx);
      out.push({ ...det, trackId: t.trackId, firstSeenAt: t.firstSeenAt, lastSeenAt: now });
    } else {
      const nextId = (prev.reduce((m, p) => Math.max(m, p.trackId), 0) + out.length + 1) | 0;
      out.push({ ...det, trackId: nextId, firstSeenAt: now, lastSeenAt: now });
    }
  }
  return out;
}

function boxIou(a: BoundingBox, b: BoundingBox): number {
  const ax2 = a.x + a.w;
  const ay2 = a.y + a.h;
  const bx2 = b.x + b.w;
  const by2 = b.y + b.h;
  const ix1 = Math.max(a.x, b.x);
  const iy1 = Math.max(a.y, b.y);
  const ix2 = Math.min(ax2, bx2);
  const iy2 = Math.min(ay2, by2);
  const iw = Math.max(0, ix2 - ix1);
  const ih = Math.max(0, iy2 - iy1);
  const inter = iw * ih;
  if (inter <= 0) return 0;
  const ua = a.w * a.h + b.w * b.h - inter;
  return inter / ua;
}
