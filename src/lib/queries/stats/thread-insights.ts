import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveStatusFilter } from "@/lib/utils/status-groups";
import type { ThreadInsight } from "@/types/stats";

async function computeThreadInsights(
  userId: string,
  statusGroups: string[],
  limit: number,
): Promise<ThreadInsight[]> {
  try {
    const statusFilter = resolveStatusFilter(statusGroups);

    const results = await prisma.projectThread.groupBy({
      by: ["threadId"],
      where: {
        project: {
          userId,
          ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
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
    console.error("[stats] computeThreadInsights failed:", {
      userId,
      statusGroups,
      limit,
      error,
    });
    throw error;
  }
}

export function getThreadInsights(userId: string, statusGroups: string[], limit = 10) {
  const cacheKey = statusGroups.length > 0 ? statusGroups.sort().join(",") : "all";

  return unstable_cache(
    () => computeThreadInsights(userId, statusGroups, limit),
    [`stats-thread-insights-${userId}-${cacheKey}-${limit}`],
    { tags: ["stats"], revalidate: 300 },
  )();
}
