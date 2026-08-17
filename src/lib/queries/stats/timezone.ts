import {
  parseCalendarDate,
  currentCalendarDate,
  addCalendarDays,
  startOfCalendarWeek,
  startOfCalendarMonth,
  startOfCalendarYear,
} from "@/lib/utils/calendar-date";
import type { LocalDateBoundaries } from "@/types/stats";

/**
 * Returns the IANA timezone for a user's stats calculations.
 * Currently reads from STATS_TIMEZONE env var (single-user).
 * Future: look up per-user timezone preference from DB.
 */
export function getUserTimezone(_userId: string): string {
  return process.env.STATS_TIMEZONE ?? "America/Edmonton";
}

/**
 * The calendar date it is right now for this user — the single entry point from "now"
 * (a real instant) into calendar-date space. STATS_TIMEZONE misconfiguration surfaces
 * as a named error rather than an opaque Intl RangeError.
 */
export function getTodayCalendarDate(timezone: string, now?: Date): string {
  try {
    return currentCalendarDate(timezone, now);
  } catch {
    throw new Error(
      `Invalid timezone "${timezone}" in STATS_TIMEZONE. Use a valid IANA timezone like "America/Edmonton".`,
    );
  }
}

/**
 * Computes day/week/month/year boundaries for filtering stored calendar dates.
 *
 * "Now" is resolved in the user's timezone to get their calendar date; the boundaries
 * are then the UTC-midnight instants that store those dates, because that is how
 * calendar dates are stored (docs/ARCHITECTURE.md, "Calendar dates"). `todayEnd` is
 * the last millisecond of that UTC day, so the bound is inclusive.
 */
export function getLocalDayBoundaries(timezone: string, now?: Date): LocalDateBoundaries {
  const today = getTodayCalendarDate(timezone, now);

  return {
    todayStart: parseCalendarDate(today),
    todayEnd: new Date(parseCalendarDate(addCalendarDays(today, 1)).getTime() - 1),
    weekStart: parseCalendarDate(startOfCalendarWeek(today)),
    monthStart: parseCalendarDate(startOfCalendarMonth(today)),
    yearStart: parseCalendarDate(startOfCalendarYear(today)),
  };
}

/**
 * The month and year the user is currently in — the one predicate every stats query
 * uses to decide whether it is caching a live period or a closed one. Month is 1-based.
 */
export function getCurrentPeriod(timezone: string, now?: Date): { year: number; month: number } {
  const today = getTodayCalendarDate(timezone, now);
  return { year: Number(today.slice(0, 4)), month: Number(today.slice(5, 7)) };
}
