/**
 * API configuration — read from Expo public env vars.
 * @see .env.example
 */

export const API_CONFIG = {
  baseUrl: (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.anifarm.app/v1').replace(/\/$/, ''),
  /** `mock` = on-device simulation (default for Expo Go); `live` = real HTTP/WebSocket */
  mode: (process.env.EXPO_PUBLIC_API_MODE ?? 'mock') as 'mock' | 'live',
  /** Default request timeout (ms) */
  timeoutMs: 15_000,
} as const;

export function isMockApiMode(): boolean {
  return API_CONFIG.mode === 'mock';
}
