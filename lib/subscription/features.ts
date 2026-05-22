import type { SubscriptionTier } from '@/types/domain';

/** Premium capabilities beyond counting / farms / exports. */
export type SubscriptionFeature =
  | 'analytics'
  | 'disease_scan'
  | 'vet_consult'
  | 'ai_alerts'
  | 'security_log'
  | 'offline_sync'
  | 'cctv';

export const FEATURE_LABELS: Record<SubscriptionFeature, string> = {
  analytics: 'Farm analytics',
  disease_scan: 'Disease scan',
  vet_consult: 'Vet consultation',
  ai_alerts: 'AI alerts & notifications',
  security_log: 'Security & intrusion log',
  offline_sync: 'Offline sync',
  cctv: 'CCTV monitoring',
};

/** Minimum paid tier that unlocks each feature. */
export const FEATURE_MIN_TIER: Record<SubscriptionFeature, SubscriptionTier> = {
  analytics: 'basic',
  disease_scan: 'pro',
  vet_consult: 'basic',
  offline_sync: 'basic',
  ai_alerts: 'pro',
  security_log: 'pro',
  cctv: 'pro',
};

/** Farm module ids that require a subscription feature (omit = always available). */
export const MODULE_FEATURE_MAP: Partial<Record<string, SubscriptionFeature>> = {
  analytics: 'analytics',
  disease: 'disease_scan',
  vet: 'vet_consult',
  alerts: 'ai_alerts',
  security: 'security_log',
  cctv: 'cctv',
  reports: 'analytics',
};
