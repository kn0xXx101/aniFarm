/**
 * Poultra AI — On-device counting service.
 *
 * Production stack:
 *   - YOLOv8n trained on Roboflow poultry datasets
 *   - Exported to TensorFlow Lite (int8 quantization for Android NNAPI)
 *   - Inference via `react-native-fast-tflite` on Skia frame processors
 *   - Multi-object tracking via ByteTrack (persistent IDs) to dedupe across frames
 *
 * This module ships a deterministic-but-realistic mock pipeline so the MVP UI
 * is fully exercisable on Expo Go and web preview without bundling a 17 MB model.
 * The interface (`detectFromImage`, `detectStream`, `trackUpdate`) is identical
 * to the production implementation that lives behind a feature flag — swap in
 * the real inferencer in `lib/ai/inference.native.ts` (see README §10).
 */

import type { BoundingBox } from '@/types/domain';

export interface DetectionResult {
  boxes: BoundingBox[];
  count: number;
  avgConfidence: number;
  inferenceMs: number;
}

export interface TrackedBird extends BoundingBox {
  trackId: number;
  firstSeenAt: number;
  lastSeenAt: number;
}

// ---- Deterministic PRNG for stable demo output --------------------------------
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

/** Generate plausible bird detections for an image URI. */
export function detectFromImage(uri: string, opts?: { target?: number }): DetectionResult {
  const start = Date.now();
  const rng = mulberry32(hashString(uri || 'default'));
  const target = opts?.target ?? Math.floor(40 + rng() * 90); // 40-130 birds
  const boxes: BoundingBox[] = [];
  let totalConf = 0;
  for (let i = 0; i < target; i++) {
    const w = 0.05 + rng() * 0.05;
    const h = w * (0.9 + rng() * 0.3);
    const x = rng() * (1 - w);
    const y = rng() * (1 - h);
    const confidence = 0.7 + rng() * 0.28;
    totalConf += confidence;
    boxes.push({ id: i, x, y, w, h, confidence });
  }
  return {
    boxes,
    count: boxes.length,
    avgConfidence: boxes.length ? totalConf / boxes.length : 0,
    inferenceMs: Date.now() - start + Math.floor(80 + rng() * 80),
  };
}

/** Streaming frame iterator used by the live camera screen. Pure JS, no native deps. */
export function generateStreamFrame(tick: number, target = 78): DetectionResult {
  const rng = mulberry32(tick * 9301 + 49297);
  const drift = Math.sin(tick / 6) * 4;
  const count = Math.max(20, Math.round(target + drift + (rng() - 0.5) * 6));
  const boxes: BoundingBox[] = [];
  let totalConf = 0;
  for (let i = 0; i < count; i++) {
    const w = 0.06 + rng() * 0.05;
    const h = w * (0.9 + rng() * 0.3);
    const x = rng() * (1 - w);
    const y = rng() * (1 - h);
    const confidence = 0.74 + rng() * 0.24;
    totalConf += confidence;
    boxes.push({ id: i, x, y, w, h, confidence });
  }
  return {
    boxes,
    count,
    avgConfidence: totalConf / Math.max(1, count),
    inferenceMs: 28 + Math.floor(rng() * 14),
  };
}

/**
 * Simplified ByteTrack-style update. Matches new detections to existing tracks
 * via IOU; produces stable IDs so we can dedupe across frames.
 */
export function trackUpdate(
  prev: TrackedBird[],
  next: BoundingBox[],
  now: number,
  iouThreshold = 0.3,
): TrackedBird[] {
  const out: TrackedBird[] = [];
  const used = new Set<number>();
  for (const det of next) {
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
