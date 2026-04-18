import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Hero Stats ─────────────────────────────────────────────────────────────

export interface HeroStatsData {
  totalWIPs: number;
  averageProgress: number;
  closestToCompletion: { projectId: string; name: string; percent: number } | null;
  finishedThisYear: number;
  finishedAllTime: number;
  totalStitchesAllProjects: number;
}

// ─── Progress Buckets ───────────────────────────────────────────────────────

export type ProgressBucketId = "unstarted" | "0-25" | "25-50" | "50-75" | "75-100";

export interface BucketProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  progressPercent: number;
  totalStitches: number;
  stitchesCompleted: number;
  lastSessionDate: Date | null;
  stitchingDays: number;
}

export interface ProgressBucket {
  id: ProgressBucketId;
  label: string;
  range: string;
  count: number;
  projects: BucketProject[];
}

// ─── Finished Projects ──────────────────────────────────────────────────────

export interface FinishedProjectData {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  fabricDescription: string | null;
  startDate: Date | null;
  finishDate: Date | null;
  startToFinishDays: number | null;
  stitchingDays: number;
  totalStitches: number;
  threadCount: number;
  beadCount: number;
  specialtyCount: number;
  avgDailyStitches: number;
  genres: string[];
}

// ─── Combined Dashboard Data ────────────────────────────────────────────────

export interface ProjectDashboardData {
  heroStats: HeroStatsData;
  progressBuckets: ProgressBucket[];
  finishedProjects: FinishedProjectData[];
}
