/**
 * API configuration — read from Expo public env vars.
 * @see .env.example
 */

export const API_CONFIG = {
  baseUrl: (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.poultra.ai/v1').replace(/\/$/, ''),
  /** Default request timeout (ms) */
  timeoutMs: 15_000,
} as const;
