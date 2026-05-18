"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { getCalendarDays, getDailyBreakdown, getMonthlyTotals } from "@/lib/queries/stats";

const monthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

const yearSchema = z.object({
  year: z.number().int().min(2020).max(2100),
});

export async function fetchCalendarMonth(month: number, year: number) {
  const user = await requireAuth();
  const parsed = monthYearSchema.parse({ month, year });
  return getCalendarDays(user.id, parsed.month, parsed.year);
}

export async function fetchDailyBreakdown(month: number, year: number) {
  const user = await requireAuth();
  const parsed = monthYearSchema.parse({ month, year });
  return getDailyBreakdown(user.id, parsed.month, parsed.year);
}

export async function fetchMonthlyTotals(year: number) {
  const user = await requireAuth();
  const parsed = yearSchema.parse({ year });
  return getMonthlyTotals(user.id, parsed.year);
}
