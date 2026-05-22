import type { Href } from 'expo-router';

type BackRule = { test: (path: string) => boolean; href: Href };

/**
 * Hidden tab / auxiliary screens: return to a sensible tab root
 * (router.back() often pops to Home unexpectedly in tab stacks).
 */
const TAB_AUX_BACK: BackRule[] = [
  { test: (p) => /\/subscription/.test(p), href: '/(tabs)/profile' },
  { test: (p) => /\/profile/.test(p), href: '/(tabs)/you' },
  { test: (p) => /\/reports/.test(p), href: '/(tabs)/analytics' },
  { test: (p) => /\/analytics/.test(p), href: '/(tabs)/dashboard' },
  { test: (p) => /\/alerts/.test(p), href: '/(tabs)/dashboard' },
  { test: (p) => /\/count-(live|image|video)/.test(p), href: '/(tabs)/scan' },
];

/** Farm ops stack screens — default back to the operations hub. */
const OPS_MODULE_BACK: BackRule[] = [
  { test: (p) => /\/feed/.test(p), href: '/operations' },
  { test: (p) => /\/health/.test(p), href: '/operations' },
  { test: (p) => /\/tasks/.test(p), href: '/operations' },
  { test: (p) => /\/sales/.test(p), href: '/operations' },
  { test: (p) => /\/vet/.test(p), href: '/operations' },
  { test: (p) => /\/security/.test(p), href: '/operations' },
  { test: (p) => /\/disease-scan/.test(p), href: '/operations' },
  { test: (p) => /\/animals\/new/.test(p), href: '/animals' },
  { test: (p) => /\/animals\/[^/]+/.test(p), href: '/animals' },
  { test: (p) => /\/animals/.test(p), href: '/operations' },
];

/** Stack / modal screens without tab history. */
const STACK_FALLBACK: BackRule[] = [
  { test: (p) => /\/operations/.test(p), href: '/(tabs)/dashboard' },
  { test: (p) => /\/cctv\/add-feed/.test(p), href: '/(tabs)/cctv' },
  { test: (p) => /\/farm\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/house\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/farm\/[^/]+/.test(p) && !/\/farm\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/admin/.test(p), href: '/(tabs)/profile' },
];

const DEFAULT_BACK: Href = '/(tabs)/dashboard';

const ALL_RULES = [...TAB_AUX_BACK, ...OPS_MODULE_BACK, ...STACK_FALLBACK];

export function getBackTarget(pathname: string): Href | null {
  for (const rule of ALL_RULES) {
    if (rule.test(pathname)) return rule.href;
  }
  return null;
}

export function getDefaultBackHref(): Href {
  return DEFAULT_BACK;
}

/** Decode `?backTo=` from module grid navigation (Account tab entry). */
export function parseBackToParam(value: string | string[] | undefined): Href | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== 'string') return undefined;
  try {
    return decodeURIComponent(raw) as Href;
  } catch {
    return raw as Href;
  }
}
