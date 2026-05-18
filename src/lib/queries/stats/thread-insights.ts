import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { ThreadInsight } from "@/types/stats";

function buildDateFilter(scope: string, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}

async function computeThreadInsights(
  userId: string,
  scope: string,
  limit: number,
): Promise<ThreadInsight[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope, tz);

    const results = await prisma.projectThread.groupBy({
      by: ["threadId"],
      where: {
        project: {
          userId,
          ...(dateFilter
            ? { sessions: { some: { date: dateFilter } } }
            : {}),
        },
      },
      _count: { projectId: true },
      orderBy: { _count: { projectId: "desc" } },
      take: limit,
    });

    if (results.length === 0) return [];

    const threadIds = results.map((r) => r.threadId);

    const threads = await prisma.thread.findMany({
      where: { id: { in: threadIds } },
      select: {
        id: true,
        colorCode: true,
        colorName: true,
        hexColor: true,
        brand: { select: { name: true } },
      },
    });

    const threadMap = new Map(threads.map((t) => [t.id, t]));

    return results
      .map((r) => {
        const thread = threadMap.get(r.threadId);
        if (!thread) return null;
        return {
          threadId: r.threadId,
          brandName: thread.brand.name,
          colorCode: thread.colorCode,
          colorName: thread.colorName,
          hexColor: thread.hexColor,
          projectCount: r._count.projectId,
        };
      })
      .filter((item): item is ThreadInsight => item !== null);
  } catch (error) {
    console.error("[stats] computeThreadInsights failed:", { userId, scope, limit, error });
    throw error;
  }
}

export function getThreadInsights(userId: string, scope: string, limit = 10) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeThreadInsights(userId, scope, limit),
    [`stats-thread-insights-${userId}-${scope}-${limit}`],
    { tags: ["stats"], revalidate },
  )();
}
