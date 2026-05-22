import { useCallback } from 'react';
import { useLocalSearchParams, usePathname, useRouter, type Href } from 'expo-router';

import {
  getBackTarget,
  getDefaultBackHref,
  parseBackToParam,
} from '@/lib/navigation/smart-back';

/**
 * Reliable back navigation for tab + stack layouts.
 * Prefers explicit parent route, then ?backTo= query, then rules, then history.
 */
export function useSmartBack(explicitBackTo?: Href) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useLocalSearchParams<{ backTo?: string }>();
  const paramBackTo = parseBackToParam(params.backTo);

  return useCallback(() => {
    const target = explicitBackTo ?? paramBackTo ?? getBackTarget(pathname);

    if (target) {
      if (router.canDismiss?.()) {
        router.dismiss();
        return;
      }
      router.navigate(target);
      return;
    }

    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.navigate(getDefaultBackHref());
  }, [explicitBackTo, paramBackTo, pathname, router]);
}
