/**
 * Unified inference entry — swaps mock vs native when available.
 */

import { USE_NATIVE_INFERENCE } from '@/lib/ai/config';
import { detectFromImage, generateStreamFrame, type DetectionResult } from '@/lib/ai/counting-service';

let native: typeof import('@/lib/ai/inference.native') | null = null;

if (USE_NATIVE_INFERENCE) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    native = require('@/lib/ai/inference.native');
  } catch {
    native = null;
  }
}

export function detectImage(uri: string, opts?: { target?: number }): DetectionResult {
  if (native?.NATIVE_INFERENCE_AVAILABLE) {
    return native.detectImageNative(uri);
  }
  return detectFromImage(uri, opts);
}

export function detectStreamFrame(tick: number, target = 78): DetectionResult {
  if (native?.NATIVE_INFERENCE_AVAILABLE) {
    return native.detectFrameNative(tick, target);
  }
  return generateStreamFrame(tick, target);
}

export { trackUpdate } from '@/lib/ai/counting-service';
export type { DetectionResult, TrackedAnimal, TrackedBird } from '@/lib/ai/counting-service';
