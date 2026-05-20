import { apiRequest } from '@/lib/api/client';

export interface HealthResponse {
  ok: boolean;
  version?: string;
}

export async function checkApiHealth(): Promise<HealthResponse> {
  try {
    const data = await apiRequest<{ ok?: boolean; version?: string }>('/health');
    return { ok: data.ok !== false, version: data.version };
  } catch {
    return { ok: false };
  }
}
