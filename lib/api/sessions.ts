import type { CountingSession } from '@/types/domain';
import { API_CONFIG, isMockApi } from '@/lib/api/config';
import { apiRequest, ApiError } from '@/lib/api/client';

export interface UploadSessionPayload {
  id: string;
  farmId: string;
  houseId?: string;
  mode: CountingSession['mode'];
  count: number;
  avgConfidence: number;
  durationMs: number;
  thumbnailUri?: string;
  notes?: string;
  createdAt: number;
}

export interface UploadSessionResult {
  id: string;
  syncedAt: number;
}

/**
 * Upload a counting session to the backend.
 * Mock mode: simulates success/failure for queue testing.
 */
export async function uploadSession(payload: UploadSessionPayload): Promise<UploadSessionResult> {
  if (isMockApi()) {
    await delay(API_CONFIG.mockLatencyMs + Math.random() * 200);
    // ~5% simulated failure in mock mode for robustness testing
    if (Math.random() < 0.05) {
      throw new ApiError('Mock server unavailable', 503);
    }
    return { id: payload.id, syncedAt: Date.now() };
  }

  return apiRequest<UploadSessionResult>('/sessions', {
    method: 'POST',
    body: payload,
  });
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
