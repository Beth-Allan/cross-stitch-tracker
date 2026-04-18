"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type {
  CurrentlyStitchingProject,
  StartNextProject,
  BuriedTreasure,
  CollectionStats,
  SpotlightProject,
  MainDashboardData,
} from "@/types/dashboard";

// ─── Internal Helpers ──────────────────────────────────────────────────────

/**
 * Currently Stitching: IN_PROGRESS and ON_HOLD projects sorted by most recent session.
 */
async function getCurrentlyStitchingProjects(userId: string): Promise<CurrentlyStitchingProject[]> {
  const projects = await prisma.project.findMany({
    where: {
      userId,
      status: { in: ["IN_PROGRESS", "ON_HOLD"] },
    },
    include: {
      chart: {
        select: {
          id: true,
          name: true,
          stitchCount: true,
          coverThumbnailUrl: true,
          designer: { select: { name: true } },
        },
      },
      sessions: {
        select: { date: true, stitchCount: true, timeSpentMinutes: true },
        orderBy: { date: "desc" },
      },
    },
  });

  return projects
    .map((p) => {
      const lastSessionDate = p.sessions[0]?.date ?? null;
      const totalTimeMinutes = p.sessions.reduce((sum, s) => sum + (s.timeSpentMinutes ?? 0), 0);
      const stitchingDays = new Set(p.sessions.map((s) => s.date.toISOString().split("T")[0])).size;
      const progressPercent =
        p.chart.stitchCount > 0
          ? Math.min(100, Math.round((p.stitchesCompleted / p.chart.stitchCount) * 100))
          : 0;

      return {
        projectId: p.id,
        chartId: p.chart.id,
        projectName: p.chart.name,
        designerName: p.chart.designer?.name ?? null,
        coverThumbnailUrl: p.chart.coverThumbnailUrl,
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
 * Returns top 2 per design decision D-05.
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
      status: c.project!.status,
      totalStitches: c.stitchCount,
      genres: c.genres.map((g) => g.name),
    }))
    .slice(0, 2);
}

/**
 * Buried Treasures: Oldest 10% of unstarted charts, max 5, sorted oldest-first.
 * Uses dynamic threshold per decision D-06. At least 1 is always returned.
 */
async function getBuriedTreasures(userId: string): Promise<BuriedTreasure[]> {
  // Get all charts that are unstarted (project with UNSTARTED status OR no project at all)
  const charts = await prisma.chart.findMany({
    where: {
      OR: [
        { project: { userId, status: "UNSTARTED" } },
        { project: null }, // Safe: single-user app. Add Chart.userId if multi-user is added.
      ],
    },
    include: {
      designer: { select: { name: true } },
      genres: { select: { name: true } },
      project: { select: { id: true } },
    },
    orderBy: { dateAdded: "asc" },
  });

  if (charts.length === 0) return [];

  // Dynamic threshold: oldest 10%, minimum 1, maximum 5
  const threshold = Math.max(Math.ceil(charts.length * 0.1), 1);
  const count = Math.min(threshold, 5);

  return charts.slice(0, count).map((c) => ({
    chartId: c.id,
    projectId: c.project?.id ?? null,
    chartName: c.name,
    designerName: c.designer?.name ?? null,
    coverThumbnailUrl: c.coverThumbnailUrl,
    dateAdded: c.dateAdded,
    daysInLibrary: Math.floor((Date.now() - c.dateAdded.getTime()) / (1000 * 60 * 60 * 24)),
    genres: c.genres.map((g) => g.name),
  }));
}

/**
 * Collection Stats: Aggregated counts across all user projects.
 */
async function getCollectionStats(userId: string): Promise<CollectionStats> {
  const allProjects = await prisma.project.findMany({
    where: { userId },
    include: {
      chart: { select: { id: true, name: true, stitchCount: true } },
    },
  });

  const totalProjects = allProjects.length;
  const totalWIP = allProjects.filter((p) => p.status === "IN_PROGRESS").length;
  const totalOnHold = allProjects.filter((p) => p.status === "ON_HOLD").length;
  const totalUnstarted = allProjects.filter((p) =>
    ["UNSTARTED", "KITTING", "KITTED"].includes(p.status),
  ).length;
  const totalFinished = allProjects.filter((p) => ["FINISHED", "FFO"].includes(p.status)).length;
  const totalStitchesCompleted = allProjects.reduce((sum, p) => sum + p.stitchesCompleted, 0);

  // Most recent finish: project with latest finishDate (FINISHED or FFO)
  const finishedProjects = allProjects.filter(
    (p) => ["FINISHED", "FFO"].includes(p.status) && p.finishDate !== null,
  );
  let mostRecentFinish: CollectionStats["mostRecentFinish"] = null;
  if (finishedProjects.length > 0) {
    const sorted = finishedProjects.sort(
      (a, b) => b.finishDate!.getTime() - a.finishDate!.getTime(),
    );
    mostRecentFinish = {
      projectId: sorted[0].id,
      name: sorted[0].chart.name,
      finishDate: sorted[0].finishDate!,
    };
  }

  // Largest project: highest chart.stitchCount across all projects
  let largestProject: CollectionStats["largestProject"] = null;
  if (allProjects.length > 0) {
    const sorted = [...allProjects].sort((a, b) => b.chart.stitchCount - a.chart.stitchCount);
    if (sorted[0].chart.stitchCount > 0) {
      largestProject = {
        projectId: sorted[0].id,
        name: sorted[0].chart.name,
        stitchCount: sorted[0].chart.stitchCount,
      };
    }
  }

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
 * Uses server-side random to avoid hydration mismatch (D-07).
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
          designer: { select: { name: true } },
          genres: { select: { name: true } },
        },
      },
    },
  });

  if (!project) return null;

  const progressPercent =
    project.chart.stitchCount > 0
      ? Math.min(100, Math.round((project.stitchesCompleted / project.chart.stitchCount) * 100))
      : 0;

  return {
    projectId: project.id,
    chartId: project.chart.id,
    projectName: project.chart.name,
    designerName: project.chart.designer?.name ?? null,
    coverThumbnailUrl: project.chart.coverThumbnailUrl,
    coverImageUrl: project.chart.coverImageUrl,
    status: project.status,
    genres: project.chart.genres.map((g) => g.name),
    totalStitches: project.chart.stitchCount,
    progressPercent,
  };
}

// ─── Exported Actions ──────────────────────────────────────────────────────

/**
 * Main Dashboard: Fetches all data sections in parallel.
 * Uses Promise.all() per D-02 for optimal Neon cold start handling.
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
