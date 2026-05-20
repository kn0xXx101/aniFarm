/**
 * Build analytics time series from local counting sessions (replaces mock-only charts when data exists).
 */

import type { AnalyticsPoint, CountingSession } from '@/types/domain';
import { buildAnalytics } from '@/lib/mock-data';

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/**
 * Aggregate sessions by day. Falls back to mock series when no sessions in range.
 */
export function buildAnalyticsFromSessions(sessions: CountingSession[], days = 30): AnalyticsPoint[] {
  const cutoff = Date.now() - days * 86400000;
  const recent = sessions.filter((s) => s.createdAt >= cutoff);

  if (recent.length === 0) {
    return buildAnalytics(days);
  }

  const byDay = new Map<string, { count: number; n: number }>();

  for (let i = days - 1; i >= 0; i--) {
    const d = dayKey(Date.now() - i * 86400000);
    byDay.set(d, { count: 0, n: 0 });
  }

  for (const s of recent) {
    const d = dayKey(s.createdAt);
    const row = byDay.get(d);
    if (!row) continue;
    row.count += s.count;
    row.n += 1;
  }

  return [...byDay.entries()].map(([date, { count, n }]) => ({
    date,
    count: n > 0 ? Math.round(count / n) : 0,
    mortality: 0, // populated when mortality events are tracked per day
  }));
}
