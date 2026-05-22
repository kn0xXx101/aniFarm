import { useMemo } from 'react';

/** Filter store lists by farm without unstable Zustand selectors (`.filter()` returns a new array every time). */
export function useFarmScopedList<T extends { farmId: string }>(items: T[], farmId?: string): T[] {
  return useMemo(
    () => (farmId ? items.filter((item) => item.farmId === farmId) : items),
    [items, farmId],
  );
}
