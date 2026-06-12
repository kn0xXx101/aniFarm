/**
 * Sentry error monitoring scaffold.
 *
 * To activate:
 *   1. npm install @sentry/react-native
 *   2. Set EXPO_PUBLIC_SENTRY_DSN in .env
 *   3. Uncomment the Sentry import and calls below
 *   4. Add the Sentry Expo plugin to app.config.ts:
 *      ['@sentry/react-native/expo', { organization: 'your-org', project: 'poultra' }]
 */

// import * as Sentry from '@sentry/react-native';

const DSN = process.env.EXPO_PUBLIC_SENTRY_DSN;

let initialised = false;

export function initSentry() {
  if (initialised || !DSN || __DEV__) return;
  // Sentry.init({
  //   dsn: DSN,
  //   tracesSampleRate: 0.2,
  //   environment: 'production',
  // });
  initialised = true;
}

export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (__DEV__) {
    console.error('[Sentry]', error, context);
    return;
  }
  // Sentry.captureException(error, { extra: context });
}

export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (__DEV__) {
    console.log(`[Sentry:${level}]`, message);
    return;
  }
  // Sentry.captureMessage(message, level);
}

export function setUser(_user: { id: string; email?: string } | null) {
  // Sentry.setUser(user);
}
