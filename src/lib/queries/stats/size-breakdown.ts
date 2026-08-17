import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import {
  calculateSizeCategory,
  getEffectiveStitchCount,
  type SizeCategory,
} from "@/lib/utils/size-category";
import { sizeCategoryConfig } from "@/lib/chart-configs";
import { STATS_CACHE_STABLE } from "./utils";
import type { SizeBreakdownItem } from "@/types/stats";

const CATEGORY_ORDER: SizeCategory[] = ["Mini", "Small", "Medium", "Large", "BAP"];

async function computeSizeBreakdown(userId: string): Promise<SizeBreakdownItem[]> {
  try {
    const charts = await prisma.chart.findMany({
      where: { project: { userId } },
      select: { stitchCount: true, stitchesWide: true, stitchesHigh: true },
    });

    const buckets: Record<SizeCategory, number> = {
      Mini: 0,
      Small: 0,
      Medium: 0,
      Large: 0,
      BAP: 0,
    };

    for (const chart of charts) {
      const { count } = getEffectiveStitchCount(
        chart.stitchCount,
        chart.stitchesWide,
        chart.stitchesHigh,
      );
      if (count === 0) continue;
      const category = calculateSizeCategory(count);
      buckets[category]++;
    }

    return CATEGORY_ORDER.map((category) => ({
      category,
      count: buckets[category],
      fill: sizeCategoryConfig[category].color,
    }));
  } catch (error) {
    console.error("[stats] computeSizeBreakdown failed:", { userId, error });
    throw error;
  }
}

export function getSizeBreakdown(userId: string) {
  return unstable_cache(() => computeSizeBreakdown(userId), [`stats-size-${userId}`], {
    tags: ["stats"],
    revalidate: STATS_CACHE_STABLE,
  })();
}
