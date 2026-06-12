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
  const farmCount = useFarmStore((s) => s.farms.length);

  const effectiveTier = useMemo(() => {
    if (trialEndsAt && Date.now() < trialEndsAt) return 'pro';
    return userTier ?? 'free';
  }, [userTier, trialEndsAt]);

  const plan = useMemo(() => getPlan(effectiveTier), [effectiveTier]);

  const usage = useMemo(() => {
    return {
      tier: effectiveTier,
      plan,
      farmCount,
      monthlyCountsUsed,
      farmsLimit: plan.maxFarms,
      countsLimit: plan.maxCountsPerMonth,
      trialDaysLeft: trialEndsAt ? Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000)) : 0,
      onTrial: !!trialEndsAt && Date.now() < trialEndsAt,
    };
  }, [effectiveTier, plan, monthlyCountsUsed, farmCount, trialEndsAt]);

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
