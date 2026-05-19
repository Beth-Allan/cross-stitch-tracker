import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import { buildDateFilter } from "./utils";
import type { GenreInsight } from "@/types/stats";

async function computeGenreInsights(
  userId: string,
  scope: string,
  limit: number,
): Promise<GenreInsight[]> {
  try {
    const tz = getUserTimezone(userId);
    const dateFilter = buildDateFilter(scope, tz);

    const projects = await prisma.project.findMany({
      where: {
        userId,
        chart: { genres: { some: {} } },
      },
      include: {
        chart: {
          include: {
            genres: { select: { id: true, name: true } },
          },
        },
        sessions: {
          where: dateFilter ? { date: dateFilter } : undefined,
          select: { stitchCount: true },
        },
      },
    });

    if (projects.length === 0) return [];

    const genreMap = new Map<string, { name: string; totalStitches: number }>();

    for (const project of projects) {
      const genres = project.chart.genres;
      if (genres.length === 0) continue;

      const projectStitches = project.sessions.reduce(
        (sum: number, s: { stitchCount: number }) => sum + s.stitchCount,
        0,
      );

      for (const genre of genres) {
        const existing = genreMap.get(genre.id);
        if (existing) {
          existing.totalStitches += projectStitches;
        } else {
          genreMap.set(genre.id, {
            name: genre.name,
            totalStitches: projectStitches,
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
    console.error("[stats] computeGenreInsights failed:", { userId, scope, limit, error });
    throw error;
  }
}

export function getGenreInsights(userId: string, scope: string, limit = 10) {
  const currentYear = new Date().getFullYear();
  const year = parseInt(scope, 10);
  const revalidate = !isNaN(year) && year < currentYear ? 3600 : 300;

  return unstable_cache(
    () => computeGenreInsights(userId, scope, limit),
    [`stats-genre-insights-${userId}-${scope}-${limit}`],
    { tags: ["stats"], revalidate },
  )();
}
