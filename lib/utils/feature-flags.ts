/**
 * Feature flags
 * Controls feature availability based on build environment.
 * Use these to gate native-only features and enable gradual rollouts.
 */

import { isExpoGo, isDevBuild } from './expo-go';

export const FEATURES = {
  /** 3D animations — disabled in Expo Go for performance */
  ENABLE_3D_ANIMATIONS: !isExpoGo(),

  /** Camera features — only available in dev/production builds */
  ENABLE_CAMERA: !isExpoGo(),

  /** Video processing — only available in dev/production builds */
  ENABLE_VIDEO: !isExpoGo(),

  /** Native maps — falls back to Leaflet WebView in Expo Go */
  ENABLE_NATIVE_MAPS: !isExpoGo(),

  /** Push notifications — only available in dev/production builds */
  ENABLE_PUSH_NOTIFICATIONS: !isExpoGo(),

  /** Analytics — enabled in all builds */
  ENABLE_ANALYTICS: true,

  /** Debug mode — only in dev builds */
  ENABLE_DEBUG_MODE: isDevBuild(),
} as const;

/**
 * Check if a feature is enabled in the current build environment.
 */
export function isFeatureEnabled(feature: keyof typeof FEATURES): boolean {
  return FEATURES[feature];
}
