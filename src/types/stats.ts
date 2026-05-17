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

// ─── Monthly Totals ─────────────────────────────────────────────────────────

export interface MonthlyTotal {
  month: string; // "Jan", "Feb", ... "Dec"
  totalStitches: number;
  year: number;
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export interface CalendarSession {
  projectId: string;
  projectName: string;
  stitchCount: number;
}

export interface CalendarDayData {
  date: string; // "YYYY-MM-DD" in user timezone
  sessions: CalendarSession[];
}

// ─── Session History ────────────────────────────────────────────────────────

export interface SessionHistoryItem {
  id: string;
  date: Date;
  projectId: string;
  projectName: string;
  stitchCount: number;
  timeSpentMinutes: number | null;
  hasPhoto: boolean;
}

export interface SessionHistoryData {
  sessions: SessionHistoryItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Pace Metrics ───────────────────────────────────────────────────────────

export interface PaceMetricsData {
  avg7Day: number;
  avg30Day: number;
  avg90Day: number;
  thisMonthStitches: number;
  lastMonthStitches: number;
  stitchRate: number | null; // stitches/hr, null when no time data
  stitchRatePrior: number | null; // prior 30-day rate for trend comparison
}

// ─── Day of Week ────────────────────────────────────────────────────────────

export interface DayOfWeekData {
  dayOfWeek: string; // "Mon", "Tue", ... "Sun"
  avgStitches: number;
}

// ─── Daily Breakdown (drill-down) ───────────────────────────────────────────

export interface DailyBreakdownEntry {
  date: string; // "YYYY-MM-DD"
  projectId: string;
  projectName: string;
  stitchCount: number;
}
