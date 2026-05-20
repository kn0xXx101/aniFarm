import type { CountingSession } from '@/types/domain';
import { apiRequest } from '@/lib/api/client';

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

export async function uploadSession(payload: UploadSessionPayload): Promise<UploadSessionResult> {
  return apiRequest<UploadSessionResult>('/sessions', {
    method: 'POST',
    body: payload,
  });
}
