import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { AvailableYearsData } from "@/types/stats";

async function computeAvailableYears(userId: string): Promise<AvailableYearsData> {
  try {
    const tz = getUserTimezone(userId);

    const sessions = await prisma.stitchSession.findMany({
      where: { project: { userId } },
      select: { date: true },
      distinct: ["date"],
    });

    if (sessions.length === 0) {
      return { years: [] };
    }

    const yearSet = new Set<number>();
    for (const session of sessions) {
      const localDate = new TZDate(session.date, tz);
      yearSet.add(localDate.getFullYear());
    }

    const years = [...yearSet].sort((a, b) => b - a);
    return { years };
  } catch (error) {
    console.error("[stats] computeAvailableYears failed:", { userId, error });
    throw error;
  }
}

export function getAvailableYears(userId: string) {
  return unstable_cache(() => computeAvailableYears(userId), [`stats-available-years-${userId}`], {
    tags: ["stats"],
    revalidate: 300,
  })();
}
