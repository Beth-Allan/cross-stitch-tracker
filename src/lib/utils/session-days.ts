import { toCalendarDate } from "@/lib/utils/calendar-date";

/** One `stitchSession.groupBy({ by: ["projectId", "date"] })` row. */
export interface SessionDayRow {
  projectId: string;
  date: Date;
  _sum?: { timeSpentMinutes: number | null };
}

export interface SessionDayTotals {
  /** The most recent stored session instant for the project. */
  lastDate: Date;
  /** Distinct calendar days the project was stitched on. */
  days: number;
  /** Total minutes logged, nulls counted as zero. */
  minutes: number;
}

/**
 * Rolls per-(project, date) groups up per project.
 *
 * Grouping in SQL is what keeps the read bounded — one row per stitching day rather than one
 * per session. Folding the day count by `toCalendarDate` rather than by the raw instant is what
 * keeps it *correct*: writes go through `parseCalendarDate` so a stored date should always be
 * UTC midnight, but nothing in the schema enforces that (`StitchSession.date` is `DateTime`,
 * not `@db.Date`), and the stats modules all normalise defensively. One row with a time of day
 * would otherwise make these dashboards disagree with `/stats` about the same project.
 */
export function summariseSessionDays(rows: SessionDayRow[]): Map<string, SessionDayTotals> {
  const daysByProject = new Map<string, { lastDate: Date; days: Set<string>; minutes: number }>();

  for (const row of rows) {
    const calendarDay = toCalendarDate(row.date);
    const minutes = row._sum?.timeSpentMinutes ?? 0;
    const existing = daysByProject.get(row.projectId);

    if (!existing) {
      daysByProject.set(row.projectId, {
        lastDate: row.date,
        days: new Set([calendarDay]),
        minutes,
      });
      continue;
    }

    existing.days.add(calendarDay);
    existing.minutes += minutes;
    if (row.date.getTime() > existing.lastDate.getTime()) existing.lastDate = row.date;
  }

  return new Map(
    [...daysByProject].map(([projectId, totals]) => [
      projectId,
      { lastDate: totals.lastDate, days: totals.days.size, minutes: totals.minutes },
    ]),
  );
}
