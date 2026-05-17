"use server";

import { requireAuth } from "@/lib/auth-guard";
import { getCalendarDays, getDailyBreakdown, getMonthlyTotals } from "@/lib/queries/stats";

export async function fetchCalendarMonth(month: number, year: number) {
  const user = await requireAuth();
  return getCalendarDays(user.id, month, year);
}

export async function fetchDailyBreakdown(month: number, year: number) {
  const user = await requireAuth();
  return getDailyBreakdown(user.id, month, year);
}

export async function fetchMonthlyTotals(year: number) {
  const user = await requireAuth();
  return getMonthlyTotals(user.id, year);
}
