/**
 * API configuration — read from Expo public env vars.
 * @see .env.example
 */

export type ApiMode = 'mock' | 'live';

const rawMode = (process.env.EXPO_PUBLIC_API_MODE ?? 'mock').toLowerCase();

export const API_CONFIG = {
  mode: (rawMode === 'live' ? 'live' : 'mock') satisfies ApiMode as ApiMode,
  baseUrl: (process.env.EXPO_PUBLIC_API_URL ?? 'https://api.poultra.ai/v1').replace(/\/$/, ''),
  /** Simulated network latency in mock mode (ms) */
  mockLatencyMs: 400,
  /** Default request timeout (ms) */
  timeoutMs: 15_000,
} as const;

export function isMockApi(): boolean {
  return API_CONFIG.mode === 'mock';
}
