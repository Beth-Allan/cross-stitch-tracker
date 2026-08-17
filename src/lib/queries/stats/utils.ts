import { parseCalendarDate } from "@/lib/utils/calendar-date";

export type Scope = "all" | (string & {});

/**
 * How long a cached stats answer may be served before it is recomputed, in seconds.
 * These are a backstop, not the primary mechanism: every stats-visible mutation calls
 * `revalidateTag("stats", { expire: 0 })`, so the window only bounds staleness that no
 * mutation can reach (a period rolling over, a clock crossing midnight).
 *
 * **Which one a new query picks.** `STATS_CACHE_STABLE` describes the *shape* of the
 * collection rather than activity in it — the four breakdowns (`collection`, `size`,
 * `designer`, `genre`) — and any period that has already closed, which is why the
 * period-scoped queries choose per call:
 * `isCurrentPeriod ? STATS_CACHE_VOLATILE : STATS_CACHE_STABLE`.
 * `STATS_CACHE_VOLATILE` is everything else and the default when it is a close call:
 * a window that is too short costs a recomputation, a window that is too long shows
 * Beth a number she has already changed.
 */
export const STATS_CACHE_VOLATILE = 300;
export const STATS_CACHE_STABLE = 3600;

/**
 * Bounds a year-scoped query. Calendar dates are stored as UTC-midnight instants, so a
 * year boundary is a calendar boundary and carries no timezone (docs/ARCHITECTURE.md,
 * "Calendar dates").
 */
export function buildDateFilter(scope: Scope): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year) || year < 1000 || year > 9998) return null;
  return {
    gte: parseCalendarDate(`${year}-01-01`),
    lt: parseCalendarDate(`${year + 1}-01-01`),
  };
}

/**
 * UTC-midnight bounds for a calendar month (`month` is 1-based), for use as
 * `{ gte: monthStart, lt: nextMonthStart }`.
 */
export function monthBounds(
  year: number,
  month: number,
): { monthStart: Date; nextMonthStart: Date } {
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    monthStart: parseCalendarDate(`${year}-${pad(month)}-01`),
    nextMonthStart:
      month === 12
        ? parseCalendarDate(`${year + 1}-01-01`)
        : parseCalendarDate(`${year}-${pad(month + 1)}-01`),
  };
}
