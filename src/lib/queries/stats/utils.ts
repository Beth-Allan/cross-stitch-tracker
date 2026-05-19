import { TZDate } from "@date-fns/tz";

export type Scope = "all" | (string & {});

export function buildDateFilter(scope: Scope, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}
