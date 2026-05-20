/**
 * Error logging service
 * Centralizes error and warning reporting across dev and production builds
 */

import { isProductionBuild } from './expo-go';

/**
 * Log an error with optional context.
 * In dev: logs to console.
 * In production: sends to error tracking service (e.g. Sentry).
 */
export function logError(error: Error, context?: Record<string, unknown>): void {
  if (__DEV__) {
    console.error('[Error]', error, context);
    return;
  }

  if (isProductionBuild()) {
    // Send to error tracking service when integrated
    // Example: Sentry.captureException(error, { extra: context });
  }
}

/**
 * Log a warning with optional context.
 * Only logs in dev mode.
 */
export function logWarning(message: string, context?: Record<string, unknown>): void {
  if (__DEV__) {
    console.warn('[Warning]', message, context);
  }
}
