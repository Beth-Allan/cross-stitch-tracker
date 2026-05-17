import { describe, it, expect, vi, beforeEach } from "vitest";
import type { StatsHeroData, CollectionBreakdownData } from "@/types/stats";

// Mock auth-guard
const mockRequireAuth = vi.fn();
vi.mock("@/lib/auth-guard", () => ({
  requireAuth: (...args: unknown[]) => mockRequireAuth(...args),
}));

// Mock query functions
const mockGetHeroStats = vi.fn();
const mockGetCollectionBreakdown = vi.fn();
vi.mock("@/lib/queries/stats", () => ({
  getHeroStats: (...args: unknown[]) => mockGetHeroStats(...args),
  getCollectionBreakdown: (...args: unknown[]) => mockGetCollectionBreakdown(...args),
}));

// Mock client components to avoid rendering complexity in server component tests
vi.mock("@/components/features/stats/stats-page-shell", () => ({
  StatsPageShell: () => null,
}));

vi.mock("@/components/features/stats/collection-status-chart", () => ({
  CollectionStatusChart: () => null,
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

describe("StatsPage server component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: "user-123", name: "Test User" });
    mockGetHeroStats.mockResolvedValue(mockHeroStats);
    mockGetCollectionBreakdown.mockResolvedValue(mockCollectionBreakdown);
  });

  it("calls requireAuth() before any data fetching", async () => {
    // Track call order
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
    await StatsPage();

    expect(mockRequireAuth).toHaveBeenCalledTimes(1);
    // requireAuth must be called before the query functions
    expect(callOrder.indexOf("requireAuth")).toBe(0);
  });

  it("calls getHeroStats and getCollectionBreakdown with the authenticated user id", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage();

    expect(mockGetHeroStats).toHaveBeenCalledWith("user-123");
    expect(mockGetCollectionBreakdown).toHaveBeenCalledWith("user-123");
  });

  it("calls both query functions (parallel via Promise.all)", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage();

    expect(mockGetHeroStats).toHaveBeenCalledTimes(1);
    expect(mockGetCollectionBreakdown).toHaveBeenCalledTimes(1);
  });
});
