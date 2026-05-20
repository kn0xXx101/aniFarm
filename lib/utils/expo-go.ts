/**
 * Expo Go Detection Utilities
 * Centralized helpers for detecting build environment
 */

import Constants from 'expo-constants';

/**
 * Check if app is running in Expo Go
 */
export function isExpoGo(): boolean {
  return Constants.executionEnvironment === 'storeClient';
}

/**
 * Check if app is running in dev build
 */
export function isDevBuild(): boolean {
  return Constants.executionEnvironment === 'standalone' && __DEV__;
}

/**
 * Check if app is production build
 */
export function isProductionBuild(): boolean {
  return Constants.executionEnvironment === 'standalone' && !__DEV__;
}

/**
 * Get build type for display
 */
export function getBuildType(): 'expo-go' | 'dev-build' | 'production' {
  if (isExpoGo()) return 'expo-go';
  if (isDevBuild()) return 'dev-build';
  return 'production';
}

/**
 * Check if native feature is available
 * @param feature - Feature name
 * @returns true if feature is available in current build
 */
export function isFeatureAvailable(
  feature: 'camera' | 'video' | 'maps' | 'notifications'
): boolean {
  // All features work in dev/production builds
  if (!isExpoGo()) return true;

  // In Expo Go, only some features work
  switch (feature) {
    case 'camera':
    case 'video':
    case 'notifications':
      return false; // Not available in Expo Go
    case 'maps':
      return true; // Available but degraded (Leaflet fallback)
    default:
      return false;
  }
}
