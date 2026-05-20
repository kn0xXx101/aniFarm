/** When true and native module exists, use TFLite path (see inference.native.ts). */
export const USE_NATIVE_INFERENCE =
  process.env.EXPO_PUBLIC_USE_TFLITE === 'true' || process.env.EXPO_PUBLIC_USE_TFLITE === '1';
