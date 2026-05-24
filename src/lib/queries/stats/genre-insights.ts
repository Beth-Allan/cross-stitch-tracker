import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { resolveStatusFilter } from "@/lib/utils/status-groups";
import type { GenreInsight } from "@/types/stats";

async function computeGenreInsights(
  userId: string,
  statusGroups: string[],
  limit: number,
): Promise<GenreInsight[]> {
  try {
    const statusFilter = resolveStatusFilter(statusGroups);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        chart: { genres: { some: {} } },
        ...(statusFilter.length > 0 ? { status: { in: statusFilter } } : {}),
      },
      include: {
        chart: {
          include: {
            genres: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (projects.length === 0) return [];

    const genreMap = new Map<string, { name: string; totalStitches: number }>();

    for (const project of projects) {
      const genres = project.chart.genres;
      if (genres.length === 0) continue;

      const chartStitches = project.chart.stitchCount ?? 0;

      for (const genre of genres) {
        const existing = genreMap.get(genre.id);
        if (existing) {
          existing.totalStitches += chartStitches;
        } else {
          genreMap.set(genre.id, {
            name: genre.name,
            totalStitches: chartStitches,
          });
        }
      }
    }

    return [...genreMap.entries()]
      .map(([genreId, { name, totalStitches }]) => ({
        genreId,
        name,
        totalStitches,
      }))
      .sort((a, b) => b.totalStitches - a.totalStitches)
      .slice(0, limit);
  } catch (error) {
    console.error("[stats] computeGenreInsights failed:", {
      userId,
      statusGroups,
      limit,
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

export function getGenreInsights(userId: string, statusGroups: string[], limit = 10) {
  const cacheKey = statusGroups.length > 0 ? [...statusGroups].sort().join(",") : "all";

  return unstable_cache(
    () => computeGenreInsights(userId, statusGroups, limit),
    [`stats-genre-insights-${userId}-${cacheKey}-${limit}`],
    { tags: ["stats"], revalidate: 300 },
  )();
}
