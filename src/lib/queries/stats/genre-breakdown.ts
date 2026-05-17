import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { GenreBreakdownItem } from "@/types/stats";

async function computeGenreBreakdown(userId: string, limit: number): Promise<GenreBreakdownItem[]> {
  try {
    const genres = await prisma.genre.findMany({
      where: {
        charts: { some: { project: { userId } } },
      },
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            charts: {
              where: { project: { userId } },
            },
          },
        },
      },
      orderBy: {
        charts: { _count: "desc" },
      },
      take: limit,
    });

    return genres.map((g) => ({
      genreId: g.id,
      name: g.name,
      count: g._count.charts,
    }));
  } catch (error) {
    console.error("[stats] computeGenreBreakdown failed:", { userId, limit, error });
    throw error;
  }
}

export function getGenreBreakdown(userId: string, limit = 10) {
  return unstable_cache(
    () => computeGenreBreakdown(userId, limit),
    [`stats-genre-${userId}-${limit}`],
    { tags: ["stats"], revalidate: 3600 },
  )();
}
