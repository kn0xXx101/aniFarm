import { API_CONFIG, isMockApi } from '@/lib/api/config';
import { apiRequest } from '@/lib/api/client';

export interface HealthResponse {
  ok: boolean;
  version?: string;
  mode: 'mock' | 'live';
}

export async function checkApiHealth(): Promise<HealthResponse> {
  if (isMockApi()) {
    await delay(API_CONFIG.mockLatencyMs);
    return { ok: true, version: 'mock-1.0', mode: 'mock' };
  }
  try {
    const data = await apiRequest<{ ok?: boolean; version?: string }>('/health');
    return { ok: data.ok !== false, version: data.version, mode: 'live' };
  } catch {
    return { ok: false, mode: 'live' };
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
