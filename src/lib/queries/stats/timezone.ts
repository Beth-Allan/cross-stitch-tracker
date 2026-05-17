import { TZDate } from "@date-fns/tz";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  startOfMonth,
  startOfYear,
} from "date-fns";
import type { LocalDateBoundaries } from "@/types/stats";

/**
 * Returns the IANA timezone for a user's stats calculations.
 * Currently reads from STATS_TIMEZONE env var (single-user).
 * Future: look up per-user timezone preference from DB.
 */
export function getUserTimezone(_userId: string): string {
  return process.env.STATS_TIMEZONE ?? "America/Denver";
}

/**
 * Computes local day/week/month/year boundaries in the given timezone.
 * All returned Dates are UTC instants representing the local boundary moments.
 *
 * Example: midnight MDT (UTC-6) returns a Date at 06:00 UTC.
 */
export function getLocalDayBoundaries(timezone: string): LocalDateBoundaries {
  const now = TZDate.tz(timezone);
  return {
    todayStart: startOfDay(now),
    todayEnd: endOfDay(now),
    weekStart: startOfWeek(now),
    monthStart: startOfMonth(now),
    yearStart: startOfYear(now),
  };
}
