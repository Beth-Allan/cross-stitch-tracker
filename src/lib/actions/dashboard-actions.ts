"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { summariseSessionDays } from "@/lib/utils/session-days";
import { mapFocalPoint } from "@/types/focal-point";
import { calculateProgressPercent } from "@/lib/utils/progress";
import type {
  CurrentlyStitchingProject,
  StartNextProject,
  BuriedTreasure,
  CollectionStats,
  SpotlightProject,
  MainDashboardData,
} from "@/types/dashboard";

/**
 * Currently Stitching: IN_PROGRESS and ON_HOLD projects sorted by most recent session.
 */
async function getCurrentlyStitchingProjects(userId: string): Promise<CurrentlyStitchingProject[]> {
  const where = {
    userId,
    status: { in: ["IN_PROGRESS", "ON_HOLD"] },
  } satisfies Prisma.ProjectWhereInput;

  // One group per (project, date) instead of one row per session; summariseSessionDays folds
  // those groups into the three figures below.
  const [projects, dayTotals] = await Promise.all([
    prisma.project.findMany({
      where,
      include: {
        chart: {
          select: {
            id: true,
            name: true,
            stitchCount: true,
            coverThumbnailUrl: true,
            focalPointX: true,
            focalPointY: true,
            designer: { select: { name: true } },
          },
        },
      },
    }),
    prisma.stitchSession.groupBy({
      by: ["projectId", "date"],
      where: { project: where },
      _sum: { timeSpentMinutes: true },
    }),
  ]);

  const daysByProject = summariseSessionDays(dayTotals);

  return projects
    .map((p) => {
      const totals = daysByProject.get(p.id);
      const lastSessionDate = totals?.lastDate ?? null;
      const totalTimeMinutes = totals?.minutes ?? 0;
      const stitchingDays = totals?.days ?? 0;
      const progressPercent = calculateProgressPercent(p.stitchesCompleted, p.chart.stitchCount);

      return {
        projectId: p.id,
        chartId: p.chart.id,
        projectName: p.chart.name,
        designerName: p.chart.designer?.name ?? null,
        coverThumbnailUrl: p.chart.coverThumbnailUrl,
        ...mapFocalPoint(p.chart.focalPointX, p.chart.focalPointY),
        status: p.status,
        stitchesCompleted: p.stitchesCompleted,
        totalStitches: p.chart.stitchCount,
        progressPercent,
        lastSessionDate,
        totalTimeMinutes,
        stitchingDays,
      };
    })
    .sort((a, b) => {
      if (!a.lastSessionDate && !b.lastSessionDate) return 0;
      if (!a.lastSessionDate) return 1;
      if (!b.lastSessionDate) return -1;
      return b.lastSessionDate.getTime() - a.lastSessionDate.getTime();
    });
}

/**
 * Start Next: Projects flagged as wantToStartNext with UNSTARTED or KITTED status.
 * Returns top 2.
 */
async function getStartNextProjects(userId: string): Promise<StartNextProject[]> {
  const charts = await prisma.chart.findMany({
    where: {
      project: {
        userId,
        wantToStartNext: true,
        status: { in: ["UNSTARTED", "KITTED"] },
      },
    },
    orderBy: { dateAdded: "asc" },
    take: 2,
    include: {
      designer: { select: { name: true } },
      genres: { select: { name: true } },
      project: { select: { id: true, status: true } },
    },
  });

  return charts
    .filter((c) => c.project)
    .map((c) => ({
      projectId: c.project!.id,
      chartId: c.id,
      projectName: c.name,
      designerName: c.designer?.name ?? null,
      coverThumbnailUrl: c.coverThumbnailUrl,
      coverImageUrl: c.coverImageUrl,
      ...mapFocalPoint(c.focalPointX, c.focalPointY),
      status: c.project!.status,
      totalStitches: c.stitchCount,
      genres: c.genres.map((g) => g.name),
    }));
}

/**
 * Buried Treasures: Oldest 10% of unstarted charts, max 5, sorted oldest-first.
 * Uses dynamic threshold. At least 1 is always returned.
 */
async function getBuriedTreasures(userId: string): Promise<BuriedTreasure[]> {
  // Charts that are unstarted (project with UNSTARTED status OR no project at all)
  const where = {
    OR: [
      { project: { userId, status: "UNSTARTED" } },
      // A chart with no project has no owner to check — Chart carries no userId, so this arm
      // is only sound while the app has one user
      { project: null },
    ],
  } satisfies Prisma.ChartWhereInput;

  // The threshold needs the size of the pool, not the pool itself: count first, then fetch only
  // the rows that will be rendered.
  const total = await prisma.chart.count({ where });
  if (total === 0) return [];

  // Dynamic threshold: oldest 10%, minimum 1, maximum 5
  const threshold = Math.max(Math.ceil(total * 0.1), 1);
  const count = Math.min(threshold, 5);

  const charts = await prisma.chart.findMany({
    where,
    include: {
      designer: { select: { name: true } },
      genres: { select: { name: true } },
      project: { select: { id: true } },
    },
    orderBy: { dateAdded: "asc" },
    take: count,
  });

  return charts.map((c) => ({
    chartId: c.id,
    projectId: c.project?.id ?? null,
    chartName: c.name,
    designerName: c.designer?.name ?? null,
    coverThumbnailUrl: c.coverThumbnailUrl,
    ...mapFocalPoint(c.focalPointX, c.focalPointY),
    dateAdded: c.dateAdded,
    daysInLibrary: Math.floor((Date.now() - c.dateAdded.getTime()) / (1000 * 60 * 60 * 24)),
    genres: c.genres.map((g) => g.name),
  }));
}

/**
 * Collection Stats: Aggregated counts across all user projects.
 */
async function getCollectionStats(userId: string): Promise<CollectionStats> {
  // Eight scalars, none of which needs a project row: the status breakdown carries six of them,
  // and the remaining two are the first row of an ordered query.
  const [statusTotals, recentFinish, largest] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      where: { userId },
      _count: { _all: true },
      _sum: { stitchesCompleted: true },
    }),
    prisma.project.findFirst({
      where: { userId, status: { in: ["FINISHED", "FFO"] }, finishDate: { not: null } },
      // id breaks ties, so two finishes on the same day always pick the same one
      orderBy: [{ finishDate: "desc" }, { id: "asc" }],
      select: { id: true, finishDate: true, chart: { select: { name: true } } },
    }),
    prisma.project.findFirst({
      where: { userId },
      orderBy: [{ chart: { stitchCount: "desc" } }, { id: "asc" }],
      select: { id: true, chart: { select: { name: true, stitchCount: true } } },
    }),
  ]);

  const countOf = (statuses: readonly string[]) =>
    statusTotals
      .filter((row) => statuses.includes(row.status))
      .reduce((sum, row) => sum + row._count._all, 0);

  const totalProjects = statusTotals.reduce((sum, row) => sum + row._count._all, 0);
  const totalWIP = countOf(["IN_PROGRESS"]);
  const totalOnHold = countOf(["ON_HOLD"]);
  const totalUnstarted = countOf(["UNSTARTED", "KITTING", "KITTED"]);
  const totalFinished = countOf(["FINISHED", "FFO"]);
  const totalStitchesCompleted = statusTotals.reduce(
    (sum, row) => sum + (row._sum.stitchesCompleted ?? 0),
    0,
  );

  const mostRecentFinish: CollectionStats["mostRecentFinish"] = recentFinish
    ? {
        projectId: recentFinish.id,
        name: recentFinish.chart.name,
        finishDate: recentFinish.finishDate!,
      }
    : null;

  const largestProject: CollectionStats["largestProject"] =
    largest && largest.chart.stitchCount > 0
      ? {
          projectId: largest.id,
          name: largest.chart.name,
          stitchCount: largest.chart.stitchCount,
        }
      : null;

  return {
    totalProjects,
    totalWIP,
    totalOnHold,
    totalUnstarted,
    totalFinished,
    totalStitchesCompleted,
    mostRecentFinish,
    largestProject,
  };
}

/**
 * Random Spotlight: Returns a random project with chart, designer, and genre data.
 * Uses server-side random to avoid hydration mismatch.
 */
async function getRandomSpotlightProject(userId: string): Promise<SpotlightProject | null> {
  const count = await prisma.project.count({ where: { userId } });
  if (count === 0) return null;

  const skip = Math.floor(Math.random() * count);
  const project = await prisma.project.findFirst({
    where: { userId },
    skip,
    include: {
      chart: {
        select: {
          id: true,
          name: true,
          stitchCount: true,
          coverThumbnailUrl: true,
          coverImageUrl: true,
          focalPointX: true,
          focalPointY: true,
          designer: { select: { name: true } },
          genres: { select: { name: true } },
        },
      },
    },
  });

  if (!project) return null;

  const progressPercent = calculateProgressPercent(
    project.stitchesCompleted,
    project.chart.stitchCount,
  );

  return {
    projectId: project.id,
    chartId: project.chart.id,
    projectName: project.chart.name,
    designerName: project.chart.designer?.name ?? null,
    coverThumbnailUrl: project.chart.coverThumbnailUrl,
    coverImageUrl: project.chart.coverImageUrl,
    ...mapFocalPoint(project.chart.focalPointX, project.chart.focalPointY),
    status: project.status,
    genres: project.chart.genres.map((g) => g.name),
    totalStitches: project.chart.stitchCount,
    progressPercent,
  };
}

/**
 * Main Dashboard: Fetches all data sections in parallel.
 * Uses Promise.all() for optimal Neon cold start handling.
 */
export async function getMainDashboardData(): Promise<MainDashboardData> {
  const user = await requireAuth();

  const [
    currentlyStitching,
    startNextProjects,
    buriedTreasures,
    collectionStats,
    spotlightProject,
  ] = await Promise.all([
    getCurrentlyStitchingProjects(user.id),
    getStartNextProjects(user.id),
    getBuriedTreasures(user.id),
    getCollectionStats(user.id),
    getRandomSpotlightProject(user.id),
  ]);

  return {
    currentlyStitching,
    startNextProjects,
    buriedTreasures,
    collectionStats,
    spotlightProject,
  };
}

/**
 * Spotlight Shuffle: Server action called by the Shuffle button.
 * Returns a new random project for the spotlight section.
 */
export async function getSpotlightProject(): Promise<SpotlightProject | null> {
  const user = await requireAuth();
  return getRandomSpotlightProject(user.id);
}
