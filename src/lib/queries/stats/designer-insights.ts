import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveStatusFilter, type StatusGroup } from "@/lib/utils/status-groups";
import { STATS_CACHE_VOLATILE } from "./utils";
import type { DesignerInsight } from "@/types/stats";

const COMPLETED_STATUSES = ["FINISHED", "FFO"] as const;

async function computeDesignerInsights(
  userId: string,
  statusGroups: StatusGroup[],
  limit: number,
): Promise<DesignerInsight[]> {
  try {
    const statusFilter = resolveStatusFilter(statusGroups);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        chart: { designerId: { not: null } },
        ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
      },
      select: {
        id: true,
        status: true,
        chart: {
          select: {
            designerId: true,
            designer: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (projects.length === 0) return [];

    const designerMap = new Map<string, { name: string; total: number; completed: number }>();

    for (const project of projects) {
      const designerId = project.chart.designerId;
      const designerName = project.chart.designer?.name;
      if (!designerId || !designerName) continue;

      const existing = designerMap.get(designerId);
      const isCompleted = COMPLETED_STATUSES.includes(
        project.status as (typeof COMPLETED_STATUSES)[number],
      );

      if (existing) {
        existing.total++;
        if (isCompleted) existing.completed++;
      } else {
        designerMap.set(designerId, {
          name: designerName,
          total: 1,
          completed: isCompleted ? 1 : 0,
        });
      }
    }

    return [...designerMap.entries()]
      .map(([designerId, { name, total, completed }]) => ({
        designerId,
        name,
        totalProjects: total,
        completedProjects: completed,
        completionRate: Math.round((completed / total) * 100),
      }))
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, limit);
  } catch (error) {
    console.error("[stats] computeDesignerInsights failed:", {
      userId,
      statusGroups,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function getDesignerInsights(userId: string, statusGroups: StatusGroup[], limit = 10) {
  const cacheKey = statusGroups.length > 0 ? [...statusGroups].sort().join(",") : "all";

  return unstable_cache(
    () => computeDesignerInsights(userId, statusGroups, limit),
    [`stats-designer-insights-${userId}-${cacheKey}-${limit}`],
    { tags: ["stats"], revalidate: STATS_CACHE_VOLATILE },
  )();
}
