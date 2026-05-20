import { apiRequest } from '@/lib/api/client';

export interface MediaUploadResult {
  url: string;
  key: string;
}

/**
 * Upload count evidence (thumbnail / frame) to the backend.
 */
export async function uploadMedia(
  localUri: string,
  kind: 'thumbnail' | 'frame',
): Promise<MediaUploadResult> {
  return apiRequest<MediaUploadResult>('/media', {
    method: 'POST',
    body: { uri: localUri, kind },
  });
}
