"use server";

import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getUserTimezone, getCurrentPeriod } from "@/lib/queries/stats/timezone";
import { calculateProgressPercent } from "@/lib/utils/progress";
import { mapFocalPoint } from "@/types/focal-point";
import type {
  ProjectDashboardData,
  HeroStatsData,
  ProgressBucket,
  ProgressBucketId,
  BucketProject,
  FinishedProjectData,
} from "@/types/dashboard";

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

/**
 * Session dates are stored as UTC-midnight instants, so one group per (project, date) is one
 * group per stitching day — enough for both the day count and the most recent session, without
 * a row per session.
 */
function summariseSessionDays(rows: Array<{ projectId: string; date: Date }>) {
  const byProject = new Map<string, { lastDate: Date; days: number }>();
  for (const row of rows) {
    const existing = byProject.get(row.projectId);
    if (!existing) {
      byProject.set(row.projectId, { lastDate: row.date, days: 1 });
      continue;
    }
    existing.days += 1;
    if (row.date.getTime() > existing.lastDate.getTime()) existing.lastDate = row.date;
  }
  return byProject;
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

/**
 * Fetches all data for the Project Dashboard tab: hero stats, progress buckets,
 * and finished project stats.
 *
 * Single query fetches all user projects with includes. All aggregations are
 * computed in-memory from the result set — no N+1 queries.
 *
 * Single prisma.project.findMany with userId filter ensures data isolation.
 * requireAuth() called at function entry.
 */
export async function getProjectDashboardData(): Promise<ProjectDashboardData> {
  const user = await requireAuth();

  const [projects, sessionDayRows] = await Promise.all([
    prisma.project.findMany({
      where: { userId: user.id },
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
            genres: { select: { name: true } },
          },
        },
        _count: {
          select: { projectThreads: true, projectBeads: true, projectSpecialty: true },
        },
        fabric: {
          select: {
            name: true,
            brand: { select: { name: true } },
          },
        },
      },
    }),
    prisma.stitchSession.groupBy({
      by: ["projectId", "date"],
      where: { project: { userId: user.id } },
    }),
  ]);

  const sessionDays = summariseSessionDays(sessionDayRows);

  const wips = projects.filter((p) => p.status === WIP_STATUS);
  const { year: currentYear } = getCurrentPeriod(getUserTimezone(user.id));

  const wipProgressValues = wips.map((p) =>
    calculateProgressPercent(p.stitchesCompleted, p.chart.stitchCount),
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
      const pct = calculateProgressPercent(p.stitchesCompleted, p.chart.stitchCount);
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
      (p) => p.finishDate && p.finishDate.getUTCFullYear() === currentYear,
    ).length,
    finishedAllTime: finishedProjects.length,
    totalStitchesAllProjects: projects.reduce((sum, p) => sum + p.stitchesCompleted, 0),
  };

  const bucketProjectsMap = new Map<ProgressBucketId, BucketProject[]>();
  for (const def of BUCKET_DEFINITIONS) {
    bucketProjectsMap.set(def.id, []);
  }

  for (const p of projects) {
    const progressPercent = calculateProgressPercent(p.stitchesCompleted, p.chart.stitchCount);
    const bucketId = assignBucketId(p.status, progressPercent);
    if (bucketId === null) continue; // finished — excluded from buckets

    const days = sessionDays.get(p.id);

    bucketProjectsMap.get(bucketId)!.push({
      projectId: p.id,
      chartId: p.chart.id,
      projectName: p.chart.name,
      designerName: p.chart.designer?.name ?? null,
      coverThumbnailUrl: p.chart.coverThumbnailUrl,
      ...mapFocalPoint(p.chart.focalPointX, p.chart.focalPointY),
      status: p.status,
      progressPercent,
      totalStitches: p.chart.stitchCount,
      stitchesCompleted: p.stitchesCompleted,
      lastSessionDate: days?.lastDate ?? null,
      stitchingDays: days?.days ?? 0,
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

  const finishedProjectData: FinishedProjectData[] = finishedProjects
    .map((p) => {
      const stitchingDays = sessionDays.get(p.id)?.days ?? 0;

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
        threadCount: p._count.projectThreads,
        beadCount: p._count.projectBeads,
        specialtyCount: p._count.projectSpecialty,
        avgDailyStitches: stitchingDays > 0 ? Math.round(p.stitchesCompleted / stitchingDays) : 0,
        genres: p.chart.genres.map((g) => g.name),
      };
    })
    .sort((a, b) => {
      // Default sort by finishDate DESC (most recent first)
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
