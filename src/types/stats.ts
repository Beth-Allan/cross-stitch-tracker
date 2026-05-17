import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Hero Stats ───────────────────────────────────────────────────────────

export interface StatsHeroData {
  stitchesToday: number;
  stitchesThisWeek: number;
  stitchesThisMonth: number;
  stitchesThisYear: number;
  totalLifetimeStitches: number;
  totalSessions: number;
  totalTimeMinutes: number;
  projectsCompleted: number;
}

// ─── Collection Breakdown ─────────────────────────────────────────────────

export interface StatusBreakdownItem {
  status: ProjectStatus;
  count: number;
  fill: string;
}

export interface CollectionBreakdownData {
  byStatus: StatusBreakdownItem[];
  totalProjects: number;
}

// ─── Size Breakdown ──────────────────────────────────────────────────────

export interface SizeBreakdownItem {
  category: string;
  count: number;
  fill: string;
}

// ─── Designer Breakdown ──────────────────────────────────────────────────

export interface DesignerBreakdownItem {
  designerId: string;
  name: string;
  count: number;
}

// ─── Genre Breakdown ─────────────────────────────────────────────────────

export interface GenreBreakdownItem {
  genreId: string;
  name: string;
  count: number;
}

// ─── Date Boundaries ──────────────────────────────────────────────────────

export interface LocalDateBoundaries {
  todayStart: Date;
  todayEnd: Date;
  weekStart: Date;
  monthStart: Date;
  yearStart: Date;
}
