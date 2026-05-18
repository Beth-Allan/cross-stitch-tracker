"use server";

import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { getCalendarDays, getDailyBreakdown, getMonthlyTotals } from "@/lib/queries/stats";
import type { CalendarDayData, DailyBreakdownEntry, MonthlyTotal } from "@/types/stats";

const monthYearSchema = z.object({
  month: z.number().int().min(1).max(12),
  year: z.number().int().min(2020).max(2100),
});

const yearSchema = z.object({
  year: z.number().int().min(2020).max(2100),
});

type StatsResult<T> = { success: true; data: T } | { success: false; error: string };

export async function fetchCalendarMonth(
  month: number,
  year: number,
): Promise<StatsResult<CalendarDayData[]>> {
  const user = await requireAuth();

  try {
    const parsed = monthYearSchema.parse({ month, year });
    const data = await getCalendarDays(user.id, parsed.month, parsed.year);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("fetchCalendarMonth error:", error);
    return { success: false, error: "Failed to load calendar data" };
  }
}

export async function fetchDailyBreakdown(
  month: number,
  year: number,
): Promise<StatsResult<DailyBreakdownEntry[]>> {
  const user = await requireAuth();

  try {
    const parsed = monthYearSchema.parse({ month, year });
    const data = await getDailyBreakdown(user.id, parsed.month, parsed.year);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("fetchDailyBreakdown error:", error);
    return { success: false, error: "Failed to load breakdown data" };
  }
}

export async function fetchMonthlyTotals(year: number): Promise<StatsResult<MonthlyTotal[]>> {
  const user = await requireAuth();

  try {
    const parsed = yearSchema.parse({ year });
    const data = await getMonthlyTotals(user.id, parsed.year);
    return { success: true, data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("fetchMonthlyTotals error:", error);
    return { success: false, error: "Failed to load monthly data" };
  }
}
