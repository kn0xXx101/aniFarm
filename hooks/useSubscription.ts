import { useMemo } from 'react';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import {
  canAddFarm,
  canExport,
  canStartCount,
  canUseFeature,
  enforceSubscriptionGate,
  getEffectiveTier,
  getUsageSnapshot,
  isOnProTrial,
  getTrialDaysLeft,
  getPlan,
  PLANS,
  PLAN_ORDER,
} from '@/lib/subscription/service';
import type { CountingModeFeature } from '@/lib/subscription/plans';
import type { SubscriptionFeature } from '@/lib/subscription/features';

export function useSubscription() {
  const userTier = useAuthStore((s) => s.user?.tier);
  const trialEndsAt = useSubscriptionStore((s) => s.trialEndsAt);
  const monthlyCountsUsed = useSubscriptionStore((s) => s.monthlyCountsUsed);
  const countsPeriodKey = useSubscriptionStore((s) => s.countsPeriodKey);
  const farmCount = useFarmStore((s) => s.farms.length);

  const effectiveTier = useMemo(() => getEffectiveTier(), [userTier, trialEndsAt]);
  const plan = useMemo(() => getPlan(effectiveTier), [effectiveTier]);
  const usage = useMemo(
    () => getUsageSnapshot(),
    [effectiveTier, monthlyCountsUsed, countsPeriodKey, farmCount],
  );

  return {
    userTier: userTier ?? 'free',
    effectiveTier,
    plan,
    usage,
    onTrial: isOnProTrial(),
    trialDaysLeft: getTrialDaysLeft(),
    plans: PLANS,
    planOrder: PLAN_ORDER,
    canAddFarm: () => canAddFarm(),
    canStartCount: (mode: CountingModeFeature) => canStartCount(mode),
    canExport: (format: 'pdf' | 'csv' | 'xlsx') => canExport(format),
    canUseFeature: (feature: SubscriptionFeature) => canUseFeature(feature),
    enforceGate: enforceSubscriptionGate,
  };
}
