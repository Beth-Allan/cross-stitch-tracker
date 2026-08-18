import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { STATS_CACHE_VOLATILE } from "./utils";

async function computeAvailableYears(userId: string): Promise<number[]> {
  try {
    const sessions = await prisma.stitchSession.findMany({
      where: { project: { userId } },
      select: { date: true },
      distinct: ["date"],
    });

    if (sessions.length === 0) {
      return [];
    }

    const yearSet = new Set<number>();
    for (const session of sessions) {
      yearSet.add(session.date.getUTCFullYear());
    }

    const years = [...yearSet].sort((a, b) => b - a);
    return years;
  } catch (error) {
    console.error("[stats] computeAvailableYears failed:", { userId, error });
    throw error;
  }
}

export function getAvailableYears(userId: string) {
  return unstable_cache(() => computeAvailableYears(userId), [`stats-available-years-${userId}`], {
    tags: ["stats"],
    revalidate: STATS_CACHE_VOLATILE,
  })();
}
