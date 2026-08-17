import { parseCalendarDate } from "@/lib/utils/calendar-date";

export type Scope = "all" | (string & {});

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
