/**
 * Native inference hook — TFLite module placeholder.
 * Install react-native-fast-tflite + bundle model, then implement detectFrame().
 */

import type { DetectionResult } from '@/lib/ai/counting-service';
import { detectFromImage, generateStreamFrame } from '@/lib/ai/counting-service';

export const NATIVE_INFERENCE_AVAILABLE = false;

export function detectFrameNative(tick: number, target = 78): DetectionResult {
  // Future: run TFLite on camera frame buffer
  return generateStreamFrame(tick, target);
}

export function detectImageNative(uri: string): DetectionResult {
  // Future: run TFLite on still image
  return detectFromImage(uri);
}
