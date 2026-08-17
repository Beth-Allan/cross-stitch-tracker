import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { collectionStatusConfig } from "@/lib/chart-configs";
import { STATS_CACHE_STABLE } from "./utils";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { CollectionBreakdownData, StatusBreakdownItem } from "@/types/stats";

const ALL_STATUSES: ProjectStatus[] = [
  "UNSTARTED",
  "KITTING",
  "KITTED",
  "IN_PROGRESS",
  "ON_HOLD",
  "FINISHED",
  "FFO",
];

async function computeCollectionBreakdown(userId: string): Promise<CollectionBreakdownData> {
  try {
    const statusCounts = await prisma.project.groupBy({
      by: ["status"],
      where: { userId },
      _count: { id: true },
    });

    const countMap = new Map(statusCounts.map((s) => [s.status, s._count.id]));

    const byStatus: StatusBreakdownItem[] = ALL_STATUSES.map((status) => ({
      status,
      count: countMap.get(status) ?? 0,
      fill: collectionStatusConfig[status]?.color ?? "var(--chart-1)",
    }));

    const totalProjects = byStatus.reduce((sum, item) => sum + item.count, 0);

    return { byStatus, totalProjects };
  } catch (error) {
    console.error("[stats] computeCollectionBreakdown failed:", { userId, error });
    throw error;
  }
}

export function getCollectionBreakdown(userId: string) {
  return unstable_cache(() => computeCollectionBreakdown(userId), [`stats-collection-${userId}`], {
    tags: ["stats"],
    revalidate: STATS_CACHE_STABLE,
  })();
}
