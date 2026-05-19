import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import { buildDateFilter, type Scope } from "./utils";
import type { DesignerInsight } from "@/types/stats";

const COMPLETED_STATUSES = ["FINISHED", "FFO"] as const;

async function computeDesignerInsights(
  userId: string,
  scope: Scope,
  limit: number,
): Promise<DesignerInsight[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope, tz);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        chart: { designerId: { not: null } },
        ...(dateFilter ? { sessions: { some: { date: dateFilter } } } : {}),
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
    console.error("[stats] computeDesignerInsights failed:", { userId, scope, limit, error });
    throw error;
  }
}

export function getDesignerInsights(userId: string, scope: Scope, limit = 10) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeDesignerInsights(userId, scope, limit),
    [`stats-designer-insights-${userId}-${scope}-${limit}`],
    { tags: ["stats"], revalidate },
  )();
}
