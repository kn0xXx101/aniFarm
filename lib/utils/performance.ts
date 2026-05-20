/**
 * Performance monitoring utilities
 */

import { InteractionManager } from 'react-native';

/**
 * Measure execution time of a function in DEV mode
 */
export function measurePerformance(name: string, fn: () => void): void {
  if (!__DEV__) {
    fn();
    return;
  }
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`[Performance] ${name}: ${(end - start).toFixed(2)}ms`);
}

/**
 * Run a callback after all interactions/animations complete
 */
export function runAfterInteractions(fn: () => void): void {
  InteractionManager.runAfterInteractions(fn);
}
