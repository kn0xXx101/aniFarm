import { useCallback } from 'react';
import { usePathname, useRouter, type Href } from 'expo-router';

import { getBackTarget, getDefaultBackHref } from '@/lib/navigation/smart-back';

/**
 * Reliable back for tab stacks where router.back() often pops to Home.
 * Prefers an explicit parent route, then history, then dashboard.
 */
export function useSmartBack(explicitBackTo?: Href) {
  const router = useRouter();
  const pathname = usePathname();

  return useCallback(() => {
    const target = explicitBackTo ?? getBackTarget(pathname);

    if (target) {
      router.navigate(target);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.navigate(getDefaultBackHref());
  }, [explicitBackTo, pathname, router]);
}
