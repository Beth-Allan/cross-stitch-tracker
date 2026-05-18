import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
  MonthlyTotal,
  CalendarDayData,
  SessionHistoryData,
  PaceMetricsData,
  DayOfWeekData,
} from "@/types/stats";

// Mock auth-guard
const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth-guard", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

// Mock query functions
const mockGetHeroStats = vi.fn();
const mockGetCollectionBreakdown = vi.fn();
const mockGetSizeBreakdown = vi.fn();
const mockGetDesignerBreakdown = vi.fn();
const mockGetGenreBreakdown = vi.fn();
const mockGetMonthlyTotals = vi.fn();
const mockGetCalendarDays = vi.fn();
const mockGetSessionHistory = vi.fn();
const mockGetPaceMetrics = vi.fn();
const mockGetDayOfWeekPattern = vi.fn();
const mockGetPersonalBests = vi.fn();
const mockGetFastestCompletions = vi.fn();
const mockGetThreadInsights = vi.fn();
const mockGetDesignerInsights = vi.fn();
const mockGetGenreInsights = vi.fn();
const mockGetCompletionEstimates = vi.fn();
const mockGetAvailableYears = vi.fn();
vi.mock("@/lib/queries/stats", () => ({
  getHeroStats: (...args: unknown[]) => mockGetHeroStats(...args),
  getCollectionBreakdown: (...args: unknown[]) => mockGetCollectionBreakdown(...args),
  getSizeBreakdown: (...args: unknown[]) => mockGetSizeBreakdown(...args),
  getDesignerBreakdown: (...args: unknown[]) => mockGetDesignerBreakdown(...args),
  getGenreBreakdown: (...args: unknown[]) => mockGetGenreBreakdown(...args),
  getMonthlyTotals: (...args: unknown[]) => mockGetMonthlyTotals(...args),
  getCalendarDays: (...args: unknown[]) => mockGetCalendarDays(...args),
  getSessionHistory: (...args: unknown[]) => mockGetSessionHistory(...args),
  getPaceMetrics: (...args: unknown[]) => mockGetPaceMetrics(...args),
  getDayOfWeekPattern: (...args: unknown[]) => mockGetDayOfWeekPattern(...args),
  getPersonalBests: (...args: unknown[]) => mockGetPersonalBests(...args),
  getFastestCompletions: (...args: unknown[]) => mockGetFastestCompletions(...args),
  getThreadInsights: (...args: unknown[]) => mockGetThreadInsights(...args),
  getDesignerInsights: (...args: unknown[]) => mockGetDesignerInsights(...args),
  getGenreInsights: (...args: unknown[]) => mockGetGenreInsights(...args),
  getCompletionEstimates: (...args: unknown[]) => mockGetCompletionEstimates(...args),
  getAvailableYears: (...args: unknown[]) => mockGetAvailableYears(...args),
}));

// Mock search params cache
const mockParse = vi.fn();
vi.mock("./search-params", () => ({
  statsSearchParamsCache: {
    parse: (...args: unknown[]) => mockParse(...args),
  },
}));

// Mock prisma for project list
const mockFindMany = vi.fn();
vi.mock("@/lib/db", () => ({
  prisma: {
    project: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}));

// Mock client components to avoid rendering complexity in server component tests
vi.mock("@/components/features/stats/stats-page-shell", () => ({
  StatsPageShell: () => null,
}));

vi.mock("@/components/features/stats/stats-overview", () => ({
  StatsOverview: () => null,
}));

vi.mock("@/components/features/stats/activity-overview", () => ({
  ActivityOverview: () => null,
}));

vi.mock("@/components/features/stats/records-overview", () => ({
  RecordsOverview: () => null,
}));

const mockHeroStats: StatsHeroData = {
  stitchesToday: 100,
  stitchesThisWeek: 500,
  stitchesThisMonth: 2000,
  stitchesThisYear: 10000,
  totalLifetimeStitches: 50000,
  totalSessions: 200,
  totalTimeMinutes: 6000,
  projectsCompleted: 5,
};

const mockCollectionBreakdown: CollectionBreakdownData = {
  byStatus: [
    { status: "IN_PROGRESS", count: 3, fill: "var(--status-in-progress)" },
    { status: "FINISHED", count: 5, fill: "var(--status-finished)" },
  ],
  totalProjects: 8,
};

const mockSizeBreakdown: SizeBreakdownItem[] = [
  { category: "Mini", count: 3, fill: "var(--chart-1)" },
  { category: "Small", count: 2, fill: "var(--chart-2)" },
  { category: "Medium", count: 2, fill: "var(--chart-3)" },
  { category: "Large", count: 1, fill: "var(--chart-4)" },
  { category: "BAP", count: 0, fill: "var(--chart-5)" },
];

const mockDesignerBreakdown: DesignerBreakdownItem[] = [
  { designerId: "d1", name: "Shannon Christine", count: 5 },
  { designerId: "d2", name: "Tiny Modernist", count: 3 },
];

const mockGenreBreakdown: GenreBreakdownItem[] = [
  { genreId: "g1", name: "Fantasy", count: 4 },
  { genreId: "g2", name: "Sampler", count: 3 },
];

const mockMonthlyTotals: MonthlyTotal[] = [{ month: "Jan", totalStitches: 3000, year: 2026 }];

const mockCalendarData: CalendarDayData[] = [
  {
    date: "2026-05-15",
    sessions: [{ projectId: "p1", chartId: "c1", projectName: "Test", stitchCount: 200 }],
  },
];

const mockSessionHistory: SessionHistoryData = {
  sessions: [],
  total: 5,
  page: 1,
  pageSize: 25,
  totalPages: 1,
};

const mockPaceMetrics: PaceMetricsData = {
  avg7Day: 250,
  avg30Day: 200,
  avg90Day: 180,
  thisMonthStitches: 5000,
  lastMonthStitches: 4000,
  stitchRate: 120,
  stitchRatePrior: 110,
};

const mockDayOfWeekData: DayOfWeekData[] = [{ dayOfWeek: "Mon", avgStitches: 200 }];

describe("StatsPage server component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: "user-123", name: "Test User" });
    mockGetHeroStats.mockResolvedValue(mockHeroStats);
    mockGetCollectionBreakdown.mockResolvedValue(mockCollectionBreakdown);
    mockGetSizeBreakdown.mockResolvedValue(mockSizeBreakdown);
    mockGetDesignerBreakdown.mockResolvedValue(mockDesignerBreakdown);
    mockGetGenreBreakdown.mockResolvedValue(mockGenreBreakdown);
    mockGetMonthlyTotals.mockResolvedValue(mockMonthlyTotals);
    mockGetCalendarDays.mockResolvedValue(mockCalendarData);
    mockGetSessionHistory.mockResolvedValue(mockSessionHistory);
    mockGetPaceMetrics.mockResolvedValue(mockPaceMetrics);
    mockGetDayOfWeekPattern.mockResolvedValue(mockDayOfWeekData);
    mockGetPersonalBests.mockResolvedValue([]);
    mockGetFastestCompletions.mockResolvedValue([]);
    mockGetThreadInsights.mockResolvedValue([]);
    mockGetDesignerInsights.mockResolvedValue([]);
    mockGetGenreInsights.mockResolvedValue([]);
    mockGetCompletionEstimates.mockResolvedValue([]);
    mockGetAvailableYears.mockResolvedValue([]);
    mockParse.mockResolvedValue({
      page: 1,
      sort: "date",
      dir: "desc",
      project: "all",
      scope: "all-time",
    });
    mockFindMany.mockResolvedValue([{ id: "p1", chart: { name: "Test Project" } }]);
  });

  it("calls requireAuth() before any data fetching", async () => {
    const callOrder: string[] = [];
    mockRequireAuth.mockImplementation(async () => {
      callOrder.push("requireAuth");
      return { id: "user-123", name: "Test User" };
    });
    mockGetHeroStats.mockImplementation(async () => {
      callOrder.push("getHeroStats");
      return mockHeroStats;
    });
    mockGetCollectionBreakdown.mockImplementation(async () => {
      callOrder.push("getCollectionBreakdown");
      return mockCollectionBreakdown;
    });

    const { default: StatsPage } = await import("./page");
    await StatsPage({ searchParams: Promise.resolve({}) });

    expect(mockRequireAuth).toHaveBeenCalledTimes(1);
    expect(callOrder.indexOf("requireAuth")).toBe(0);
  });

  it("calls all 10 queries with the authenticated user id", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage({ searchParams: Promise.resolve({}) });

    expect(mockGetHeroStats).toHaveBeenCalledWith("user-123");
    expect(mockGetCollectionBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetSizeBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetDesignerBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetGenreBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetMonthlyTotals).toHaveBeenCalledWith("user-123", expect.any(Number));
    expect(mockGetCalendarDays).toHaveBeenCalledWith(
      "user-123",
      expect.any(Number),
      expect.any(Number),
    );
    expect(mockGetSessionHistory).toHaveBeenCalledWith("user-123", 1, "date", "desc", null);
    expect(mockGetPaceMetrics).toHaveBeenCalledWith("user-123");
    expect(mockGetDayOfWeekPattern).toHaveBeenCalledWith("user-123");
  });

  it("propagates auth error and does not call queries when requireAuth rejects", async () => {
    mockRequireAuth.mockRejectedValue(new Error("Unauthorized"));

    const { default: StatsPage } = await import("./page");
    await expect(StatsPage({ searchParams: Promise.resolve({}) })).rejects.toThrow("Unauthorized");

    expect(mockGetHeroStats).not.toHaveBeenCalled();
    expect(mockGetCollectionBreakdown).not.toHaveBeenCalled();
    expect(mockGetMonthlyTotals).not.toHaveBeenCalled();
    expect(mockGetPaceMetrics).not.toHaveBeenCalled();
  });

  it("calls all 10 query functions in parallel via Promise.all", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage({ searchParams: Promise.resolve({}) });

    expect(mockGetHeroStats).toHaveBeenCalledTimes(1);
    expect(mockGetCollectionBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetSizeBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetDesignerBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetGenreBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetMonthlyTotals).toHaveBeenCalledTimes(1);
    expect(mockGetCalendarDays).toHaveBeenCalledTimes(1);
    expect(mockGetSessionHistory).toHaveBeenCalledTimes(1);
    expect(mockGetPaceMetrics).toHaveBeenCalledTimes(1);
    expect(mockGetDayOfWeekPattern).toHaveBeenCalledTimes(1);
  });

  it("parses searchParams for session history pagination", async () => {
    const searchParams = Promise.resolve({ page: "2", sort: "stitches", dir: "asc" });
    mockParse.mockResolvedValue({ page: 2, sort: "stitches", dir: "asc", project: "all" });

    const { default: StatsPage } = await import("./page");
    await StatsPage({ searchParams });

    expect(mockParse).toHaveBeenCalledWith(searchParams);
    expect(mockGetSessionHistory).toHaveBeenCalledWith("user-123", 2, "stitches", "asc", null);
  });

  it("fetches project list for session table filter dropdown", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage({ searchParams: Promise.resolve({}) });

    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: "user-123" },
        select: expect.objectContaining({ id: true }),
        orderBy: expect.anything(),
      }),
    );
  });
});
