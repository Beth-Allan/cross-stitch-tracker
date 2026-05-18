import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import type { SessionHistoryData } from "@/types/stats";

const PAGE_SIZE = 25;

async function computeSessionHistory(
  userId: string,
  rawPage: number,
  sortField: string,
  sortDir: string,
  projectId: string | null,
): Promise<SessionHistoryData> {
  try {
    const page = Math.max(1, rawPage);
    const where: Prisma.StitchSessionWhereInput = {
      project: { userId },
      ...(projectId && projectId !== "all" ? { projectId } : {}),
    };

    const validDirs = ["asc", "desc"] as const;
    const direction = validDirs.includes(sortDir as (typeof validDirs)[number])
      ? (sortDir as "asc" | "desc")
      : "desc";

    const orderBy = {
      [sortField === "stitches"
        ? "stitchCount"
        : sortField === "time"
          ? "timeSpentMinutes"
          : "date"]: direction,
    };

    const [sessions, total] = await Promise.all([
      prisma.stitchSession.findMany({
        where,
        orderBy,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          project: {
            select: { id: true, chartId: true, chart: { select: { name: true } } },
          },
        },
      }),
      prisma.stitchSession.count({ where }),
    ]);

    return {
      sessions: sessions.map((s) => ({
        id: s.id,
        date: s.date,
        projectId: s.project.id,
        chartId: s.project.chartId,
        projectName: s.project.chart.name,
        stitchCount: s.stitchCount,
        timeSpentMinutes: s.timeSpentMinutes,
        hasPhoto: !!s.photoKey,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    };
  } catch (error) {
    console.error("[stats] computeSessionHistory failed:", {
      userId,
      page: rawPage,
      sortField,
      sortDir,
      projectId,
      error,
    });
    throw error;
  }
}

export function getSessionHistory(
  userId: string,
  page: number,
  sortField: string,
  sortDir: string,
  projectId: string | null,
) {
  return unstable_cache(
    () => computeSessionHistory(userId, page, sortField, sortDir, projectId),
    [`stats-sessions-${userId}-${page}-${sortField}-${sortDir}-${projectId ?? "all"}`],
    { tags: ["stats"], revalidate: 300 },
  )();
}
