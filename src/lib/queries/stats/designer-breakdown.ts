import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { DesignerBreakdownItem } from "@/types/stats";

async function computeDesignerBreakdown(
  userId: string,
  limit: number,
): Promise<DesignerBreakdownItem[]> {
  const results = await prisma.chart.groupBy({
    by: ["designerId"],
    where: {
      project: { userId },
      designerId: { not: null },
    },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: limit,
  });

  if (results.length === 0) return [];

  const designerIds = results.map((r) => r.designerId!);
  const designers = await prisma.designer.findMany({
    where: { id: { in: designerIds } },
    select: { id: true, name: true },
  });

  const nameMap = new Map(designers.map((d) => [d.id, d.name]));

  return results.map((r) => ({
    designerId: r.designerId!,
    name: nameMap.get(r.designerId!) ?? "Unknown",
    count: r._count.id,
  }));
}

export function getDesignerBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeDesignerBreakdown(userId, limit),
    [`stats-designer-${userId}`],
    { tags: ["stats"], revalidate: 3600 },
  )();
}
