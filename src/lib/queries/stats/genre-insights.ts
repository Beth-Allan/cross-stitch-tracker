import { unstable_cache } from "next/cache";
import { TZDate } from "@date-fns/tz";
import { prisma } from "@/lib/db";
import { getUserTimezone } from "./timezone";
import type { GenreInsight } from "@/types/stats";

function buildDateFilter(scope: string, tz: string): { gte: Date; lt: Date } | null {
  if (scope === "all") return null;
  const year = parseInt(scope, 10);
  if (isNaN(year)) return null;
  const yearStart = new TZDate(year, 0, 1, 0, 0, 0, tz);
  const nextYearStart = new TZDate(year + 1, 0, 1, 0, 0, 0, tz);
  return { gte: yearStart, lt: nextYearStart };
}

interface SessionRow {
  stitchCount: number;
  date?: Date;
}

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
          select: { stitchCount: true, date: true },
        },
      },
    });

    if (projects.length === 0) return [];

    const genreMap = new Map<string, { name: string; totalStitches: number }>();

    for (const project of projects) {
      const genres = project.chart.genres;
      if (genres.length === 0) continue;

      let sessions: SessionRow[] = project.sessions;
      if (dateFilter) {
        sessions = sessions.filter((s: SessionRow) => {
          if (!s.date) return false;
          return s.date >= dateFilter.gte && s.date < dateFilter.lt;
        });
      }

      const projectStitches = sessions.reduce(
        (sum: number, s: SessionRow) => sum + s.stitchCount,
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
