import { API_CONFIG, isMockApi } from '@/lib/api/config';
import { apiRequest } from '@/lib/api/client';

export interface MediaUploadResult {
  url: string;
  key: string;
}

/**
 * Upload count evidence (thumbnail / frame). Mock returns local URI as URL.
 */
export async function uploadMedia(localUri: string, kind: 'thumbnail' | 'frame'): Promise<MediaUploadResult> {
  if (isMockApi()) {
    await new Promise((r) => setTimeout(r, API_CONFIG.mockLatencyMs));
    return { url: localUri, key: `mock/${kind}/${Date.now()}` };
  }

  return apiRequest<MediaUploadResult>('/media', {
    method: 'POST',
    body: { uri: localUri, kind },
  });
}
