import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Currently Stitching ───────────────────────────────────────────────────

export interface CurrentlyStitchingProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  stitchesCompleted: number;
  totalStitches: number;
  progressPercent: number; // 0-100, capped
  lastSessionDate: Date | null;
  totalTimeMinutes: number;
  stitchingDays: number;
}

// ─── Start Next ────────────────────────────────────────────────────────────

export interface StartNextProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  status: ProjectStatus;
  totalStitches: number;
  genres: string[];
}

// ─── Buried Treasures ──────────────────────────────────────────────────────

export interface BuriedTreasure {
  chartId: string;
  projectId: string | null;
  chartName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  dateAdded: Date;
  daysInLibrary: number;
  genres: string[];
}

// ─── Spotlight ─────────────────────────────────────────────────────────────

export interface SpotlightProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  status: ProjectStatus;
  genres: string[];
  totalStitches: number;
  progressPercent: number;
}

// ─── Collection Stats ──────────────────────────────────────────────────────

export interface CollectionStats {
  totalProjects: number;
  totalWIP: number;
  totalOnHold: number;
  totalUnstarted: number;
  totalFinished: number;
  totalStitchesCompleted: number;
  mostRecentFinish: { projectId: string; name: string; finishDate: Date } | null;
  largestProject: { projectId: string; name: string; stitchCount: number } | null;
}

// ─── Main Dashboard Composite ──────────────────────────────────────────────

export interface MainDashboardData {
  currentlyStitching: CurrentlyStitchingProject[];
  startNextProjects: StartNextProject[];
  buriedTreasures: BuriedTreasure[];
  collectionStats: CollectionStats;
  spotlightProject: SpotlightProject | null;
}

// ─── Hero Stats (Project Dashboard) ────────────────────────────────────────

export interface HeroStatsData {
  totalWIPs: number;
  averageProgress: number;
  closestToCompletion: { projectId: string; name: string; percent: number } | null;
  finishedThisYear: number;
  finishedAllTime: number;
  totalStitchesAllProjects: number;
}

// ─── Progress Buckets ──────────────────────────────────────────────────────

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

// ─── Finished Projects ─────────────────────────────────────────────────────

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

// ─── Project Dashboard Composite ───────────────────────────────────────────

export interface ProjectDashboardData {
  heroStats: HeroStatsData;
  progressBuckets: ProgressBucket[];
  finishedProjects: FinishedProjectData[];
}

// ─── Shopping Cart Types ───────────────────────────────────────────────────

export interface ShoppingCartProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  threadCount: number;
  beadCount: number;
  specialtyCount: number;
  fabricNeeded: boolean;
}

export interface ShoppingSupplyNeed {
  junctionId: string;
  supplyId: string;
  brandName: string;
  code: string;
  colorName: string;
  hexColor: string | null;
  quantityRequired: number;
  quantityAcquired: number;
  unit: string;
  projectId: string;
  projectName: string;
}

export interface ShoppingFabricNeed {
  projectId: string;
  projectName: string;
  stitchesWide: number;
  stitchesHigh: number;
  hasFabric: boolean;
  fabricName: string | null;
}

export interface ShoppingCartData {
  projects: ShoppingCartProject[];
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
}
