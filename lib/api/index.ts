export { API_CONFIG } from '@/lib/api/config';
export { apiRequest, ApiError, setApiAuthToken, getApiAuthToken } from '@/lib/api/client';
export { checkApiHealth, type HealthResponse } from '@/lib/api/health';
export { uploadSession, type UploadSessionPayload, type UploadSessionResult } from '@/lib/api/sessions';
export { uploadMedia, type MediaUploadResult } from '@/lib/api/media';
export {
  registerCctvFeed,
  deleteCctvFeed,
  updateCctvFeed,
  fetchLatestCount,
  openCctvSocket,
  startPolling,
  type RegisterFeedPayload,
  type RegisterFeedResult,
} from '@/lib/api/cctv';
