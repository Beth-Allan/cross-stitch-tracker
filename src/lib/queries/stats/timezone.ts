import { TZDate } from "@date-fns/tz";
import { startOfDay, endOfDay, startOfWeek, startOfMonth, startOfYear } from "date-fns";
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
 * Computes local day/week/month/year boundaries in the given timezone.
 * All returned Dates are UTC instants representing the local boundary moments.
 *
 * Example: midnight MDT (UTC-6) returns a Date at 06:00 UTC.
 */
export function getLocalDayBoundaries(timezone: string, now?: TZDate): LocalDateBoundaries {
  const current = now ?? TZDate.tz(timezone);
  if (isNaN(current.getTime())) {
    throw new Error(
      `Invalid timezone "${timezone}" in STATS_TIMEZONE. Use a valid IANA timezone like "America/Edmonton".`,
    );
  }
  return {
    todayStart: startOfDay(current),
    todayEnd: endOfDay(current),
    weekStart: startOfWeek(current),
    monthStart: startOfMonth(current),
    yearStart: startOfYear(current),
  };
}
