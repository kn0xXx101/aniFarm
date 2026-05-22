import { usePlanGate } from '@/hooks/usePlanGate';
import type { SubscriptionFeature } from '@/lib/subscription/features';

/**
 * @deprecated Prefer usePlanGate + UpgradeBanner (no forced redirect).
 * Kept for compatibility — returns gate state only.
 */
export function useFeatureGate(feature: SubscriptionFeature) {
  return usePlanGate(feature);
}
