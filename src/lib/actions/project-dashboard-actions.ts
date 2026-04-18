"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import type {
  ProjectDashboardData,
  HeroStatsData,
  ProgressBucket,
  ProgressBucketId,
  BucketProject,
  FinishedProjectData,
} from "@/types/dashboard";

// ─── Bucket Definitions ────────────────────────────────────────────────────

const BUCKET_DEFINITIONS: ReadonlyArray<{
  id: ProgressBucketId;
  label: string;
  range: string;
}> = [
  { id: "unstarted", label: "Unstarted", range: "0%" },
  { id: "0-25", label: "Just Getting Started", range: "1-25%" },
  { id: "25-50", label: "Making Progress", range: "25-50%" },
  { id: "50-75", label: "Over Halfway", range: "50-75%" },
  { id: "75-100", label: "Almost There", range: "75-100%" },
];

const UNSTARTED_STATUSES = new Set(["UNSTARTED", "KITTING", "KITTED"]);
const FINISHED_STATUSES = new Set(["FINISHED", "FFO"]);
const WIP_STATUS = "IN_PROGRESS";

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeProgressPercent(stitchesCompleted: number, stitchCount: number): number {
  return stitchCount > 0 ? Math.min(100, Math.round((stitchesCompleted / stitchCount) * 100)) : 0;
}

function countDistinctSessionDays(sessions: Array<{ date: Date }>): number {
  return new Set(sessions.map((s) => s.date.toISOString().split("T")[0])).size;
}

function assignBucketId(status: string, progressPercent: number): ProgressBucketId | null {
  if (FINISHED_STATUSES.has(status)) return null; // excluded from buckets
  if (UNSTARTED_STATUSES.has(status)) return "unstarted";

  // IN_PROGRESS or ON_HOLD — assign by percent range
  if (progressPercent <= 0) return "unstarted";
  if (progressPercent <= 25) return "0-25";
  if (progressPercent <= 50) return "25-50";
  if (progressPercent <= 75) return "50-75";
  return "75-100";
}

// ─── Main Action ────────────────────────────────────────────────────────────

/**
 * Fetches all data for the Project Dashboard tab: hero stats, progress buckets,
 * and finished project stats.
 *
 * Single query fetches all user projects with includes. All aggregations are
 * computed in-memory from the result set — no N+1 queries.
 *
 * T-09-03: Single prisma.project.findMany with userId filter ensures data isolation.
 * T-09-04: requireAuth() called at function entry.
 */
export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const user = await requireAuth();

  const projects = await prisma.project.findMany({
    where: { userId: user.id },
    include: {
      chart: {
        select: {
          id: true,
          name: true,
          stitchCount: true,
          coverThumbnailUrl: true,
          designer: { select: { name: true } },
          genres: { select: { name: true } },
        },
      },
      sessions: {
        select: { date: true, stitchCount: true },
        orderBy: { date: "desc" },
      },
      projectThreads: { select: { id: true } },
      projectBeads: { select: { id: true } },
      projectSpecialty: { select: { id: true } },
      fabric: {
        select: {
          name: true,
          brand: { select: { name: true } },
        },
      },
    },
  });

  // ─── Hero Stats ─────────────────────────────────────────────────────────

  const wips = projects.filter((p) => p.status === WIP_STATUS);
  const currentYear = new Date().getFullYear();

  const wipProgressValues = wips.map((p) =>
    computeProgressPercent(p.stitchesCompleted, p.chart.stitchCount),
  );

  const averageProgress =
    wipProgressValues.length > 0
      ? Math.round(wipProgressValues.reduce((a, b) => a + b, 0) / wipProgressValues.length)
      : 0;

  let closestToCompletion: HeroStatsData["closestToCompletion"] = null;
  if (wips.length > 0) {
    let maxPercent = -1;
    let maxProject: (typeof wips)[number] | null = null;
    for (const p of wips) {
      const pct = computeProgressPercent(p.stitchesCompleted, p.chart.stitchCount);
      if (pct > maxPercent) {
        maxPercent = pct;
        maxProject = p;
      }
    }
    if (maxProject) {
      closestToCompletion = {
        projectId: maxProject.id,
        name: maxProject.chart.name,
        percent: maxPercent,
      };
    }
  }

  const finishedProjects = projects.filter((p) => FINISHED_STATUSES.has(p.status));

  const heroStats: HeroStatsData = {
    totalWIPs: wips.length,
    averageProgress,
    closestToCompletion,
    finishedThisYear: finishedProjects.filter(
      (p) => p.finishDate && p.finishDate.getFullYear() === currentYear,
    ).length,
    finishedAllTime: finishedProjects.length,
    totalStitchesAllProjects: projects.reduce((sum, p) => sum + p.stitchesCompleted, 0),
  };

  // ─── Progress Buckets ───────────────────────────────────────────────────

  const bucketProjectsMap = new Map<ProgressBucketId, BucketProject[]>();
  for (const def of BUCKET_DEFINITIONS) {
    bucketProjectsMap.set(def.id, []);
  }

  for (const p of projects) {
    const progressPercent = computeProgressPercent(p.stitchesCompleted, p.chart.stitchCount);
    const bucketId = assignBucketId(p.status, progressPercent);
    if (bucketId === null) continue; // finished — excluded from buckets

    const lastSession = p.sessions[0] ?? null;
    const stitchingDays = countDistinctSessionDays(p.sessions);

    bucketProjectsMap.get(bucketId)!.push({
      projectId: p.id,
      chartId: p.chart.id,
      projectName: p.chart.name,
      designerName: p.chart.designer?.name ?? null,
      coverThumbnailUrl: p.chart.coverThumbnailUrl,
      status: p.status,
      progressPercent,
      totalStitches: p.chart.stitchCount,
      stitchesCompleted: p.stitchesCompleted,
      lastSessionDate: lastSession?.date ?? null,
      stitchingDays,
    });
  }

  const progressBuckets: ProgressBucket[] = BUCKET_DEFINITIONS.map((def) => {
    const bucketProjects = bucketProjectsMap.get(def.id)!;
    return {
      id: def.id,
      label: def.label,
      range: def.range,
      count: bucketProjects.length,
      projects: bucketProjects,
    };
  });

  // ─── Finished Projects ──────────────────────────────────────────────────

  const finishedProjectData: FinishedProjectData[] = finishedProjects
    .map((p) => {
      const stitchingDays = countDistinctSessionDays(p.sessions);

      const startToFinishDays =
        p.startDate && p.finishDate
          ? Math.ceil((p.finishDate.getTime() - p.startDate.getTime()) / (1000 * 60 * 60 * 24))
          : null;

      return {
        projectId: p.id,
        chartId: p.chart.id,
        projectName: p.chart.name,
        designerName: p.chart.designer?.name ?? null,
        coverThumbnailUrl: p.chart.coverThumbnailUrl,
        fabricDescription: p.fabric ? `${p.fabric.brand.name} ${p.fabric.name}` : null,
        startDate: p.startDate,
        finishDate: p.finishDate,
        startToFinishDays,
        stitchingDays,
        totalStitches: p.chart.stitchCount,
        threadCount: p.projectThreads.length,
        beadCount: p.projectBeads.length,
        specialtyCount: p.projectSpecialty.length,
        avgDailyStitches: stitchingDays > 0 ? Math.round(p.stitchesCompleted / stitchingDays) : 0,
        genres: p.chart.genres.map((g) => g.name),
      };
    })
    .sort((a, b) => {
      // D-15: Default sort by finishDate DESC (most recent first)
      if (!a.finishDate && !b.finishDate) return 0;
      if (!a.finishDate) return 1;
      if (!b.finishDate) return -1;
      return b.finishDate.getTime() - a.finishDate.getTime();
    });

  return {
    heroStats,
    progressBuckets,
    finishedProjects: finishedProjectData,
  };
}
