import { Linking, Platform } from 'react-native';

import { useAuthStore } from '@/lib/stores/auth-store';
import { useSubscriptionStore } from '@/lib/stores/subscription-store';
import { useFarmStore } from '@/lib/stores/farm-store';
import {
  getPlan,
  PLANS,
  PLAN_ORDER,
  tierMeetsMinimum,
  planIncludesFeature,
  type CountingModeFeature,
  type PlanDefinition,
} from '@/lib/subscription/plans';
import {
  FEATURE_LABELS,
  FEATURE_MIN_TIER,
  type SubscriptionFeature,
} from '@/lib/subscription/features';
import {
  getActiveTier,
  initRevenueCat,
  isRevenueCatConfigured,
  purchasePackageForTier,
  restorePurchases,
} from '@/lib/payments/revenue-cat';
import type { SubscriptionTier } from '@/types/domain';

export type SubscriptionBlockReason =
  | 'farm_limit'
  | 'count_limit'
  | 'mode_not_included'
  | 'export_not_included'
  | 'feature_not_included'
  | 'not_authenticated';

export interface SubscriptionCheck {
  ok: boolean;
  reason?: SubscriptionBlockReason;
  message?: string;
  requiredTier?: SubscriptionTier;
}

/** Effective tier including active Pro trial. */
export function getEffectiveTier(): SubscriptionTier {
  const user = useAuthStore.getState().user;
  const { trialEndsAt } = useSubscriptionStore.getState();
  if (trialEndsAt && Date.now() < trialEndsAt) return 'pro';
  return user?.tier ?? 'free';
}

export function isOnProTrial(): boolean {
  const { trialEndsAt } = useSubscriptionStore.getState();
  return !!trialEndsAt && Date.now() < trialEndsAt;
}

export function getTrialDaysLeft(): number {
  const { trialEndsAt } = useSubscriptionStore.getState();
  if (!trialEndsAt) return 0;
  return Math.max(0, Math.ceil((trialEndsAt - Date.now()) / 86400000));
}

export function getUsageSnapshot() {
  useSubscriptionStore.getState().resetPeriodIfNeeded();
  const tier = getEffectiveTier();
  const plan = getPlan(tier);
  const farmCount = useFarmStore.getState().farms.length;
  const { monthlyCountsUsed } = useSubscriptionStore.getState();

  return {
    tier,
    plan,
    farmCount,
    monthlyCountsUsed,
    farmsLimit: plan.maxFarms,
    countsLimit: plan.maxCountsPerMonth,
    trialDaysLeft: getTrialDaysLeft(),
    onTrial: isOnProTrial(),
  };
}

function limitLabel(value: number) {
  return Number.isFinite(value) ? String(value) : 'Unlimited';
}

export function canAddFarm(currentFarmCount?: number): SubscriptionCheck {
  const user = useAuthStore.getState().user;
  if (!user) return { ok: false, reason: 'not_authenticated', message: 'Sign in to add farms.' };

  const tier = getEffectiveTier();
  const plan = getPlan(tier);
  const count = currentFarmCount ?? useFarmStore.getState().farms.length;

  if (count < plan.maxFarms) return { ok: true };

  const requiredTier: SubscriptionTier =
    tier === 'free' ? 'basic' : tier === 'basic' ? 'pro' : 'enterprise';

  return {
    ok: false,
    reason: 'farm_limit',
    requiredTier,
    message: `${plan.name} allows ${limitLabel(plan.maxFarms)} farm(s). Upgrade to add more.`,
  };
}

export function canStartCount(mode: CountingModeFeature): SubscriptionCheck {
  const user = useAuthStore.getState().user;
  if (!user) return { ok: false, reason: 'not_authenticated', message: 'Sign in to run AI counts.' };

  useSubscriptionStore.getState().resetPeriodIfNeeded();
  const tier = getEffectiveTier();
  const plan = getPlan(tier);

  if (!plan.modes.includes(mode)) {
    const requiredTier: SubscriptionTier = mode === 'live' || mode === 'cctv' ? 'pro' : 'basic';
    return {
      ok: false,
      reason: 'mode_not_included',
      requiredTier,
      message: `${plan.name} does not include ${mode} counting. Upgrade your plan.`,
    };
  }

  if (plan.maxCountsPerMonth !== Number.POSITIVE_INFINITY) {
    const used = useSubscriptionStore.getState().monthlyCountsUsed;
    if (used >= plan.maxCountsPerMonth) {
      return {
        ok: false,
        reason: 'count_limit',
        requiredTier: tier === 'free' ? 'basic' : 'pro',
        message: `Monthly limit reached (${used}/${plan.maxCountsPerMonth}). Upgrade for more counts.`,
      };
    }
  }

  return { ok: true };
}

export function canUseFeature(feature: SubscriptionFeature, overrideTier?: SubscriptionTier): SubscriptionCheck {
  const user = useAuthStore.getState().user;
  if (!user) return { ok: false, reason: 'not_authenticated', message: 'Sign in to use this feature.' };

  const tier = overrideTier ?? getEffectiveTier();
  const plan = getPlan(tier);
  if (planIncludesFeature(plan, feature)) return { ok: true };

  const requiredTier = FEATURE_MIN_TIER[feature];
  return {
    ok: false,
    reason: 'feature_not_included',
    requiredTier,
    message: `${plan.name} does not include ${FEATURE_LABELS[feature]}. Upgrade to ${getPlan(requiredTier).name}.`,
  };
}

export function canExport(format: 'pdf' | 'csv' | 'xlsx'): SubscriptionCheck {
  const user = useAuthStore.getState().user;
  if (!user) return { ok: false, reason: 'not_authenticated', message: 'Sign in to export reports.' };

  const tier = getEffectiveTier();
  const plan = getPlan(tier);
  const allowed =
    (format === 'pdf' && plan.exportPdf) ||
    (format === 'csv' && plan.exportCsv) ||
    (format === 'xlsx' && plan.exportXlsx);

  if (allowed) return { ok: true };

  const requiredTier: SubscriptionTier = format === 'pdf' || format === 'xlsx' ? 'pro' : 'basic';
  return {
    ok: false,
    reason: 'export_not_included',
    requiredTier,
    message: `${plan.name} does not include ${format.toUpperCase()} export. Upgrade to unlock.`,
  };
}

export function recordCountSessionCompleted() {
  useSubscriptionStore.getState().incrementCountUsage();
}

/** Apply tier to auth store only if it has changed. */
function setAuthTierOnly(tier: SubscriptionTier) {
  const current = useAuthStore.getState().user?.tier;
  if (current === tier) return; // no-op — prevents infinite re-render loops
  useAuthStore.setState((s) => ({
    user: s.user ? { ...s.user, tier } : s.user,
  }));
}

export function applyPlan(tier: SubscriptionTier, opts?: { fromPurchase?: boolean }) {
  setAuthTierOnly(tier);
  const sub = useSubscriptionStore.getState();

  if (tier === 'pro' || tier === 'basic' || tier === 'enterprise') {
    sub.setBillingMeta({ subscribedAt: Date.now() });
    if (opts?.fromPurchase) sub.clearTrial();
  } else {
    sub.setBillingMeta({ subscribedAt: null });
    sub.clearTrial();
  }
}

function resolveStoredAndRemoteTier(
  stored: SubscriptionTier,
  remote: SubscriptionTier | null,
): SubscriptionTier {
  if (!remote) return stored;
  if (tierMeetsMinimum(remote, stored)) return remote;
  if (tierMeetsMinimum(stored, remote)) return stored;
  return remote;
}

export async function syncSubscriptionOnLaunch(userId: string, fallbackTier: SubscriptionTier) {
  useSubscriptionStore.getState().resetPeriodIfNeeded();

  if (!isRevenueCatConfigured()) {
    applyPlan(fallbackTier);
    return getEffectiveTier();
  }

  try {
    await initRevenueCat(userId);
    const rcTier = await getActiveTier();
    const resolved = resolveStoredAndRemoteTier(fallbackTier, rcTier === 'free' ? null : rcTier);
    applyPlan(resolved, { fromPurchase: !!rcTier && tierMeetsMinimum(rcTier, fallbackTier) });
    return getEffectiveTier();
  } catch (e) {
    console.warn('[subscription] RevenueCat sync failed', e);
  }

  applyPlan(fallbackTier);
  return getEffectiveTier();
}

export async function purchasePlan(tier: SubscriptionTier): Promise<{ ok: boolean; message: string }> {
  if (tier === 'enterprise') {
    useSubscriptionStore.getState().setBillingMeta({ enterpriseInquiryAt: Date.now() });
    const mail = 'mailto:sales@anifarm.app?subject=aniFarm%20Enterprise';
    if (Platform.OS === 'web') {
      window.open(mail, '_blank');
    } else {
      await Linking.openURL(mail).catch(() => {});
    }
    return { ok: true, message: 'Sales team notified — we will contact you within 1 business day.' };
  }

  if (tier === 'free') {
    applyPlan('free');
    return { ok: true, message: 'Switched to Free plan.' };
  }

  if (isRevenueCatConfigured()) {
    const userId = useAuthStore.getState().user?.id;
    if (userId) await initRevenueCat(userId);
    const purchased = await purchasePackageForTier(tier);
    if (purchased) {
      applyPlan(purchased, { fromPurchase: true });
      return { ok: true, message: `Subscribed to ${getPlan(purchased).name}.` };
    }
    return { ok: false, message: 'Purchase was cancelled or failed.' };
  }

  // Demo / dev: persist tier locally (Expo Go without store keys)
  applyPlan(tier, { fromPurchase: true });
  return {
    ok: true,
    message: `Plan set to ${getPlan(tier).name} (demo billing — add RevenueCat keys for real IAP).`,
  };
}

export async function restoreSubscription(): Promise<{ ok: boolean; message: string }> {
  if (isRevenueCatConfigured()) {
    const userId = useAuthStore.getState().user?.id;
    if (userId) await initRevenueCat(userId);
    const tier = await restorePurchases();
    if (tier) {
      applyPlan(tier, { fromPurchase: true });
      return { ok: true, message: `Restored ${getPlan(tier).name} plan.` };
    }
    return { ok: false, message: 'No active subscription found to restore.' };
  }

  const tier = useAuthStore.getState().user?.tier ?? 'free';
  applyPlan(tier);
  return { ok: true, message: `Restored saved plan (${getPlan(tier).name}).` };
}

export function startRegistrationTrial(days = 14) {
  useSubscriptionStore.getState().startProTrial(days);
}

export type SubscriptionToast = (opts: {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}) => void;

/** Show upgrade prompt and navigate to plans when a gate fails. */
export function enforceSubscriptionGate(
  check: SubscriptionCheck,
  navigate: (path: '/(tabs)/subscription') => void,
  toast: SubscriptionToast,
  title = 'Upgrade required',
): boolean {
  if (check.ok) return true;
  toast({
    title,
    description: check.message ?? 'Upgrade your plan to continue.',
    variant: 'destructive',
  });
  navigate('/(tabs)/subscription');
  return false;
}

export { PLANS, PLAN_ORDER, getPlan, planIncludesFeature };
export type { PlanDefinition };
export type { SubscriptionFeature } from '@/lib/subscription/features';
export { FEATURE_LABELS, FEATURE_MIN_TIER, MODULE_FEATURE_MAP } from '@/lib/subscription/features';
