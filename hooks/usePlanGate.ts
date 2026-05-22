import { useMemo } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { canUseFeature, type SubscriptionCheck } from '@/lib/subscription/service';
import type { SubscriptionFeature } from '@/lib/subscription/features';

/** Reactive subscription gate for a feature (no redirect — use UpgradeBanner in UI). */
export function usePlanGate(feature: SubscriptionFeature) {
  const userTier = useAuthStore((s) => s.user?.tier);
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);

  const gate = useMemo(
    () => canUseFeature(feature),
    [feature, userTier, trialEndsAt],
  );

  return { gate, allowed: gate.ok } satisfies { gate: SubscriptionCheck; allowed: boolean };
}
