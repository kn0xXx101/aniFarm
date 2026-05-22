import type { Href } from 'expo-router';

type BackRule = { test: (path: string) => boolean; href: Href };

/** Tab-adjacent screens: navigate here instead of router.back() (avoids jumping to Home). */
const TAB_AUX_BACK: BackRule[] = [
  { test: (p) => /\/subscription/.test(p), href: '/(tabs)/profile' },
  { test: (p) => /\/reports/.test(p), href: '/(tabs)/analytics' },
  { test: (p) => /\/analytics/.test(p), href: '/(tabs)/dashboard' },
  { test: (p) => /\/profile/.test(p), href: '/(tabs)/you' },
  { test: (p) => /\/alerts/.test(p), href: '/(tabs)/dashboard' },
  {
    test: (p) => /\/count-(live|image|video)/.test(p),
    href: '/(tabs)/scan',
  },
];

/** Stack / modal screens: fallback when history is empty. */
const STACK_FALLBACK: BackRule[] = [
  { test: (p) => /\/operations/.test(p), href: '/(tabs)/dashboard' },
  { test: (p) => /\/animals\/new/.test(p), href: '/animals' },
  { test: (p) => /\/animals\/[^/]+/.test(p), href: '/animals' },
  { test: (p) => /\/animals/.test(p), href: '/(tabs)/dashboard' },
  {
    test: (p) => /\/(feed|health|tasks|sales|vet|security|disease-scan)/.test(p),
    href: '/(tabs)/dashboard',
  },
  { test: (p) => /\/cctv\/add-feed/.test(p), href: '/(tabs)/cctv' },
  { test: (p) => /\/farm\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/house\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/farm\/[^/]+/.test(p) && !/\/farm\/new/.test(p), href: '/(tabs)/farms' },
  { test: (p) => /\/admin/.test(p), href: '/(tabs)/profile' },
];

const DEFAULT_BACK: Href = '/(tabs)/dashboard';

export function getBackTarget(pathname: string): Href | null {
  for (const rule of TAB_AUX_BACK) {
    if (rule.test(pathname)) return rule.href;
  }
  for (const rule of STACK_FALLBACK) {
    if (rule.test(pathname)) return rule.href;
  }
  return null;
}

export function getDefaultBackHref(): Href {
  return DEFAULT_BACK;
}
