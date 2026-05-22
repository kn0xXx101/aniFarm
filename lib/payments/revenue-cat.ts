/**
 * RevenueCat IAP — active when EXPO_PUBLIC_REVENUECAT_KEY_* are set and
 * react-native-purchases is installed (dev client / production build).
 */

import type { SubscriptionTier } from '@/types/domain';
import { ENTITLEMENT_MAP, PRODUCT_IDS } from '@/lib/subscription/plans';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID ?? '';

let initialised = false;
let PurchasesModule: typeof import('react-native-purchases') | null = null;

export function isRevenueCatConfigured(): boolean {
  return !!(IOS_KEY || ANDROID_KEY);
}

async function getPurchases() {
  if (PurchasesModule) return PurchasesModule.default;
  try {
    PurchasesModule = await import('react-native-purchases');
    return PurchasesModule.default;
  } catch {
    return null;
  }
}

function tierFromEntitlements(active: Record<string, unknown>): SubscriptionTier | null {
  const keys = Object.keys(active);
  let best: SubscriptionTier | null = null;
  const rank: Record<SubscriptionTier, number> = { free: 0, basic: 1, pro: 2, enterprise: 3 };
  for (const key of keys) {
    const mapped = ENTITLEMENT_MAP[key];
    if (mapped && (!best || rank[mapped] > rank[best])) best = mapped;
  }
  return best;
}

export async function initRevenueCat(userId: string) {
  if (initialised || !isRevenueCatConfigured()) return;
  const Purchases = await getPurchases();
  if (!Purchases) return;
  const { Platform } = await import('react-native');
  const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  if (!key) return;
  Purchases.configure({ apiKey: key, appUserID: userId });
  initialised = true;
}

export async function getOfferings() {
  const Purchases = await getPurchases();
  if (!Purchases || !initialised) return [];
  const offerings = await Purchases.getOfferings();
  return offerings.current?.availablePackages ?? [];
}

export async function purchasePackageForTier(tier: SubscriptionTier): Promise<SubscriptionTier | null> {
  const Purchases = await getPurchases();
  if (!Purchases || !initialised) return null;

  const offerings = await Purchases.getOfferings();
  const packages = offerings.current?.availablePackages ?? [];
  const productId =
    tier === 'basic' ? PRODUCT_IDS.basic : tier === 'pro' ? PRODUCT_IDS.pro_monthly : undefined;
  if (!productId) return null;

  const pkg = packages.find((p) => p.product.identifier === productId);
  if (!pkg) return null;

  const { customerInfo } = await Purchases.purchasePackage(pkg);
  return tierFromEntitlements(customerInfo.entitlements.active);
}

export async function restorePurchases(): Promise<SubscriptionTier | null> {
  const Purchases = await getPurchases();
  if (!Purchases || !initialised) return null;
  const customerInfo = await Purchases.restorePurchases();
  return tierFromEntitlements(customerInfo.entitlements.active);
}

export async function getActiveTier(): Promise<SubscriptionTier> {
  const Purchases = await getPurchases();
  if (!Purchases || !initialised) return 'free';
  const customerInfo = await Purchases.getCustomerInfo();
  return tierFromEntitlements(customerInfo.entitlements.active) ?? 'free';
}
