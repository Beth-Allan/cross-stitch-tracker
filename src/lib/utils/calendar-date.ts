/**
 * Calendar dates — the one convention for date-only values.
 *
 * Session dates and project start/finish/FFO dates are calendar dates: they carry no
 * time and no zone. The convention (docs/ARCHITECTURE.md, "Calendar dates") is to store
 * a calendar date as the **UTC-midnight instant** of that date and to read every date
 * part back **in UTC**. Reading such an instant in a local zone lands on the previous
 * day, which is exactly the defect this module exists to make impossible.
 *
 * "Now" is the only genuine instant in the system: it is resolved in the user's
 * timezone by `currentCalendarDate` and immediately reduced to a calendar date, after
 * which all arithmetic is calendar arithmetic and daylight saving cannot reach it.
 */

const CALENDAR_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 86_400_000;

const DEFAULT_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

/** Parses `YYYY-MM-DD` into the UTC-midnight instant that stores it. */
export function parseCalendarDate(value: string): Date {
  if (!CALENDAR_DATE_PATTERN.test(value)) {
    throw new Error(`Not a calendar date (expected YYYY-MM-DD): "${value}"`);
  }
  const instant = new Date(`${value}T00:00:00.000Z`);
  // V8 rolls impossible days over ("2026-02-31" becomes March 3) — the round trip catches it
  if (Number.isNaN(instant.getTime()) || instant.toISOString().slice(0, 10) !== value) {
    throw new Error(`Not a calendar date (no such day): "${value}"`);
  }
  return instant;
}

/** Reads the calendar date a stored instant represents, in UTC. */
export function toCalendarDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

/** The calendar date it is *right now* in the given IANA timezone. */
export function currentCalendarDate(timeZone: string, now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Moves a calendar date by whole days. Immune to daylight saving by construction. */
export function addCalendarDays(value: string, days: number): string {
  return toCalendarDate(new Date(parseCalendarDate(value).getTime() + days * MS_PER_DAY));
}

/** Whole calendar days from `earlier` to `later` — negative when `later` is earlier. */
export function daysBetweenCalendarDates(later: string, earlier: string): number {
  return Math.round(
    (parseCalendarDate(later).getTime() - parseCalendarDate(earlier).getTime()) / MS_PER_DAY,
  );
}

/** The Sunday that starts the week containing this date (date-fns' default week start). */
export function startOfCalendarWeek(value: string): string {
  return addCalendarDays(value, -parseCalendarDate(value).getUTCDay());
}

/** The first day of the month containing this date. */
export function startOfCalendarMonth(value: string): string {
  return `${toCalendarDate(parseCalendarDate(value)).slice(0, 7)}-01`;
}

/** January 1st of the year containing this date. */
export function startOfCalendarYear(value: string): string {
  return `${toCalendarDate(parseCalendarDate(value)).slice(0, 4)}-01-01`;
}

/**
 * Formats a calendar date for display. Forces `timeZone: "UTC"` so the viewer's own
 * zone can never shift the stored date — the browser half of the same convention.
 */
export function formatCalendarDate(
  value: Date | string,
  options: Intl.DateTimeFormatOptions = DEFAULT_FORMAT_OPTIONS,
  locale = "en-US",
): string {
  const instant = value instanceof Date ? value : parseCalendarDate(value);
  return instant.toLocaleDateString(locale, { ...options, timeZone: "UTC" });
}
