/**
 * Build analytics time series from local counting sessions.
 */

import type { AnalyticsPoint, CountingSession } from '@/types/domain';

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Generate an empty zero-filled series for `days` days ending today. */
function emptySeriesForDays(days: number): AnalyticsPoint[] {
  const out: AnalyticsPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    out.push({
      date: dayKey(Date.now() - i * 86400000),
      count: 0,
      mortality: 0,
    });
  }
  return out;
}

/**
 * Aggregate sessions by day.
 * Returns a zero-filled series when no sessions exist in the range.
 */
export function buildAnalyticsFromSessions(
  sessions: CountingSession[],
  days = 30,
): AnalyticsPoint[] {
  const cutoff = Date.now() - days * 86400000;
  const recent = sessions.filter((s) => s.createdAt >= cutoff);

  if (recent.length === 0) {
    return emptySeriesForDays(days);
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
    mortality: 0,
  }));
}
