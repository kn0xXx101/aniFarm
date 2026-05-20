/**
 * RevenueCat in-app purchase scaffold.
 *
 * To activate:
 *   1. npm install react-native-purchases
 *   2. Set EXPO_PUBLIC_REVENUECAT_KEY_IOS and EXPO_PUBLIC_REVENUECAT_KEY_ANDROID in .env
 *   3. Uncomment the Purchases import and calls below
 *   4. Configure products in RevenueCat dashboard matching PRODUCT_IDS below
 */

// import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import type { SubscriptionTier } from '@/types/domain';

const IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY_IOS ?? '';
const ANDROID_KEY = process.env.EXPO_PUBLIC_REVENUECAT_KEY_ANDROID ?? '';

/** RevenueCat entitlement → app tier mapping */
export const ENTITLEMENT_MAP: Record<string, SubscriptionTier> = {
  basic_monthly: 'basic',
  pro_monthly: 'pro',
  pro_annual: 'pro',
  enterprise: 'enterprise',
};

/** App Store / Play Store product identifiers */
export const PRODUCT_IDS = {
  basic: 'anifarm_basic_monthly',
  pro_monthly: 'anifarm_pro_monthly',
  pro_annual: 'anifarm_pro_annual',
} as const;

let initialised = false;

export async function initRevenueCat(userId: string) {
  if (initialised) return;
  // const { Platform } = await import('react-native');
  // const key = Platform.OS === 'ios' ? IOS_KEY : ANDROID_KEY;
  // if (!key) return;
  // await Purchases.configure({ apiKey: key, appUserID: userId });
  initialised = true;
}

export async function getOfferings() {
  // const offerings = await Purchases.getOfferings();
  // return offerings.current?.availablePackages ?? [];
  return [] as unknown[];
}

export async function purchasePackage(_pkg: unknown): Promise<SubscriptionTier | null> {
  // const { customerInfo } = await Purchases.purchasePackage(pkg as PurchasesPackage);
  // const entitlements = Object.keys(customerInfo.entitlements.active);
  // for (const e of entitlements) {
  //   if (ENTITLEMENT_MAP[e]) return ENTITLEMENT_MAP[e];
  // }
  return null;
}

export async function restorePurchases(): Promise<SubscriptionTier | null> {
  // const customerInfo = await Purchases.restorePurchases();
  // const entitlements = Object.keys(customerInfo.entitlements.active);
  // for (const e of entitlements) {
  //   if (ENTITLEMENT_MAP[e]) return ENTITLEMENT_MAP[e];
  // }
  return null;
}

export async function getActiveTier(): Promise<SubscriptionTier> {
  // const customerInfo = await Purchases.getCustomerInfo();
  // const entitlements = Object.keys(customerInfo.entitlements.active);
  // for (const e of entitlements) {
  //   if (ENTITLEMENT_MAP[e]) return ENTITLEMENT_MAP[e];
  // }
  return 'free';
}
