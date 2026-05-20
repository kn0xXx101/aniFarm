export { API_CONFIG, isMockApi, type ApiMode } from '@/lib/api/config';
export { apiRequest, ApiError, setApiAuthToken, getApiAuthToken } from '@/lib/api/client';
export { checkApiHealth, type HealthResponse } from '@/lib/api/health';
export { uploadSession, type UploadSessionPayload, type UploadSessionResult } from '@/lib/api/sessions';
export { uploadMedia, type MediaUploadResult } from '@/lib/api/media';
