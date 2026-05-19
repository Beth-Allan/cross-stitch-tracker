import type { ProjectStatus } from "@/generated/prisma/client";
import type { SizeCategory } from "@/lib/utils/size-category";

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

export type MonthLabel =
  | "Jan"
  | "Feb"
  | "Mar"
  | "Apr"
  | "May"
  | "Jun"
  | "Jul"
  | "Aug"
  | "Sep"
  | "Oct"
  | "Nov"
  | "Dec";

export interface MonthlyTotal {
  month: MonthLabel;
  totalStitches: number;
  year: number;
}

// ─── Calendar ───────────────────────────────────────────────────────────────

export interface CalendarSession {
  projectId: string;
  chartId: string;
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
  date: string; // "YYYY-MM-DD" in user timezone
  projectId: string;
  chartId: string;
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

export type DayLabel = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export interface DayOfWeekData {
  dayOfWeek: DayLabel;
  avgStitches: number;
}

// ─── Daily Breakdown (drill-down) ───────────────────────────────────────────

export interface DailyBreakdownEntry extends CalendarSession {
  date: string; // "YYYY-MM-DD"
}

// ─── Personal Bests ────────────────────────────────────────────────────────

export type RecordType = "bestDay" | "bestSession" | "longestStreak" | "currentStreak";

export interface ProjectLinkedRecord {
  type: "bestDay" | "bestSession";
  label: string;
  value: number;
  unit: string;
  date?: string;
  projectId?: string;
  chartId?: string;
  projectName?: string;
}

export interface AggregateRecord {
  type: "longestStreak" | "currentStreak";
  label: string;
  value: number;
  unit: string;
}

export type PersonalBestRecord = ProjectLinkedRecord | AggregateRecord;

// ─── Fastest Completions ───────────────────────────────────────────────────

export type { SizeCategory } from "@/lib/utils/size-category";

export interface FastestCompletion {
  sizeCategory: SizeCategory;
  daysToComplete: number;
  projectId: string;
  chartId: string;
  projectName: string;
  startDate: string;
  finishDate: string;
}

// ─── Thread Insights ───────────────────────────────────────────────────────

export interface ThreadInsight {
  threadId: string;
  brandName: string;
  colorCode: string;
  colorName: string;
  hexColor: string;
  projectCount: number;
}

// ─── Designer Insights ─────────────────────────────────────────────────────

export interface DesignerInsight {
  designerId: string;
  name: string;
  totalProjects: number;
  completedProjects: number;
  completionRate: number;
}

// ─── Genre Insights ────────────────────────────────────────────────────────

export interface GenreInsight {
  genreId: string;
  name: string;
  totalStitches: number;
}

// ─── Completion Estimates ──────────────────────────────────────────────────

export interface CompletionEstimate {
  projectId: string;
  chartId: string;
  projectName: string;
  stitchesCompleted: number;
  totalStitches: number;
  percentComplete: number;
  estimatedDate: string;
  avgPerDay: number;
}

// ─── Broken Records (celebration system) ───────────────────────────────────

export type BrokenRecordType = Exclude<RecordType, "currentStreak">;

export interface BrokenRecord {
  type: BrokenRecordType;
  label: string;
  oldValue: number;
  newValue: number;
  unit: string;
}
