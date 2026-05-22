import type { SubscriptionTier } from '@/types/domain';
import type { SubscriptionFeature } from '@/lib/subscription/features';

export type CountingModeFeature = 'live' | 'image' | 'video' | 'cctv';

export interface PlanDefinition {
  tier: SubscriptionTier;
  name: string;
  priceLabel: string;
  cadence: string;
  maxFarms: number;
  maxCountsPerMonth: number;
  modes: CountingModeFeature[];
  offlineSync: boolean;
  analytics: boolean;
  diseaseScan: boolean;
  vetConsult: boolean;
  securityLog: boolean;
  exportPdf: boolean;
  exportCsv: boolean;
  exportXlsx: boolean;
  aiTracking: boolean;
  prioritySupport: boolean;
  productId?: string;
  highlight?: boolean;
  features: string[];
}

export const PLAN_ORDER: SubscriptionTier[] = ['free', 'basic', 'pro', 'enterprise'];

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    tier: 'free',
    name: 'Free',
    priceLabel: '$0',
    cadence: 'forever',
    maxFarms: 1,
    maxCountsPerMonth: 20,
    modes: ['image'],
    offlineSync: false,
    analytics: false,
    diseaseScan: false,
    vetConsult: false,
    securityLog: false,
    exportPdf: false,
    exportCsv: false,
    exportXlsx: false,
    aiTracking: false,
    prioritySupport: false,
    features: [
      '1 farm · 20 image counts / month',
      'Animals, feed, health, tasks & sales',
      'Image counting only',
      'Community support',
    ],
  },
  basic: {
    tier: 'basic',
    name: 'Basic',
    priceLabel: '$19',
    cadence: '/ month',
    maxFarms: 3,
    maxCountsPerMonth: 500,
    modes: ['image', 'video'],
    offlineSync: true,
    analytics: true,
    diseaseScan: false,
    vetConsult: true,
    securityLog: false,
    exportPdf: false,
    exportCsv: true,
    exportXlsx: false,
    aiTracking: false,
    prioritySupport: false,
    productId: 'anifarm_basic_monthly',
    features: [
      '3 farms · 500 counts / month',
      'Image + video counting',
      'Analytics & vet chat',
      'CSV exports · offline sync',
    ],
  },
  pro: {
    tier: 'pro',
    name: 'Pro',
    priceLabel: '$49',
    cadence: '/ month',
    maxFarms: Number.POSITIVE_INFINITY,
    maxCountsPerMonth: Number.POSITIVE_INFINITY,
    modes: ['live', 'image', 'video', 'cctv'],
    offlineSync: true,
    analytics: true,
    diseaseScan: true,
    vetConsult: true,
    securityLog: true,
    exportPdf: true,
    exportCsv: true,
    exportXlsx: true,
    aiTracking: true,
    prioritySupport: true,
    productId: 'anifarm_pro_monthly',
    highlight: true,
    features: [
      'Unlimited farms & AI counts',
      'Live · image · video · CCTV',
      'Disease scan · AI alerts · security log',
      'Analytics & vet chat (from Basic)',
      'PDF / CSV / Excel · priority support',
    ],
  },
  enterprise: {
    tier: 'enterprise',
    name: 'Enterprise',
    priceLabel: 'Custom',
    cadence: 'contact us',
    maxFarms: Number.POSITIVE_INFINITY,
    maxCountsPerMonth: Number.POSITIVE_INFINITY,
    modes: ['live', 'image', 'video', 'cctv'],
    offlineSync: true,
    analytics: true,
    diseaseScan: true,
    vetConsult: true,
    securityLog: true,
    exportPdf: true,
    exportCsv: true,
    exportXlsx: true,
    aiTracking: true,
    prioritySupport: true,
    features: [
      'Multi-tenant org',
      'On-prem / private cloud',
      'Custom YOLOv8 training',
      'SLA + dedicated CSM',
      'API + integrations',
    ],
  },
};

export function getPlan(tier: SubscriptionTier | undefined | null): PlanDefinition {
  if (tier && tier in PLANS) return PLANS[tier as SubscriptionTier];
  return PLANS.free;
}

export function planIncludesFeature(
  plan: PlanDefinition | undefined,
  feature: SubscriptionFeature,
): boolean {
  if (!plan) return false;
  switch (feature) {
    case 'analytics':
      return plan.analytics;
    case 'disease_scan':
      return plan.diseaseScan;
    case 'vet_consult':
      return plan.vetConsult;
    case 'ai_alerts':
      return plan.aiTracking;
    case 'security_log':
      return plan.securityLog;
    case 'offline_sync':
      return plan.offlineSync;
    case 'cctv':
      return plan.modes.includes('cctv');
    default:
      return false;
  }
}

export function tierMeetsMinimum(current: SubscriptionTier, required: SubscriptionTier): boolean {
  return PLAN_ORDER.indexOf(current) >= PLAN_ORDER.indexOf(required);
}

/** App Store / Play Store product identifiers (RevenueCat) */
export const PRODUCT_IDS = {
  basic: 'anifarm_basic_monthly',
  pro_monthly: 'anifarm_pro_monthly',
  pro_annual: 'anifarm_pro_annual',
} as const;

/** RevenueCat entitlement id → app tier */
export const ENTITLEMENT_MAP: Record<string, SubscriptionTier> = {
  basic_monthly: 'basic',
  pro_monthly: 'pro',
  pro_annual: 'pro',
  enterprise: 'enterprise',
};
