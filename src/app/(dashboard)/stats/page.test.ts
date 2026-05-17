import { describe, it, expect, vi, beforeEach } from "vitest";
import type {
  StatsHeroData,
  CollectionBreakdownData,
  SizeBreakdownItem,
  DesignerBreakdownItem,
  GenreBreakdownItem,
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
vi.mock("@/lib/queries/stats", () => ({
  getHeroStats: (...args: unknown[]) => mockGetHeroStats(...args),
  getCollectionBreakdown: (...args: unknown[]) => mockGetCollectionBreakdown(...args),
  getSizeBreakdown: (...args: unknown[]) => mockGetSizeBreakdown(...args),
  getDesignerBreakdown: (...args: unknown[]) => mockGetDesignerBreakdown(...args),
  getGenreBreakdown: (...args: unknown[]) => mockGetGenreBreakdown(...args),
}));

// Mock client components to avoid rendering complexity in server component tests
vi.mock("@/components/features/stats/stats-page-shell", () => ({
  StatsPageShell: () => null,
}));

vi.mock("@/components/features/stats/stats-overview", () => ({
  StatsOverview: () => null,
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

describe("StatsPage server component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireAuth.mockResolvedValue({ id: "user-123", name: "Test User" });
    mockGetHeroStats.mockResolvedValue(mockHeroStats);
    mockGetCollectionBreakdown.mockResolvedValue(mockCollectionBreakdown);
    mockGetSizeBreakdown.mockResolvedValue(mockSizeBreakdown);
    mockGetDesignerBreakdown.mockResolvedValue(mockDesignerBreakdown);
    mockGetGenreBreakdown.mockResolvedValue(mockGenreBreakdown);
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
    mockGetSizeBreakdown.mockImplementation(async () => {
      callOrder.push("getSizeBreakdown");
      return mockSizeBreakdown;
    });
    mockGetDesignerBreakdown.mockImplementation(async () => {
      callOrder.push("getDesignerBreakdown");
      return mockDesignerBreakdown;
    });
    mockGetGenreBreakdown.mockImplementation(async () => {
      callOrder.push("getGenreBreakdown");
      return mockGenreBreakdown;
    });

    const { default: StatsPage } = await import("./page");
    await StatsPage();

    expect(mockRequireAuth).toHaveBeenCalledTimes(1);
    // requireAuth must be called before the query functions
    expect(callOrder.indexOf("requireAuth")).toBe(0);
  });

  it("calls all queries with the authenticated user id", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage();

    expect(mockGetHeroStats).toHaveBeenCalledWith("user-123");
    expect(mockGetCollectionBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetSizeBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetDesignerBreakdown).toHaveBeenCalledWith("user-123");
    expect(mockGetGenreBreakdown).toHaveBeenCalledWith("user-123");
  });

  it("calls all 5 query functions in parallel via Promise.all", async () => {
    const { default: StatsPage } = await import("./page");
    await StatsPage();

    expect(mockGetHeroStats).toHaveBeenCalledTimes(1);
    expect(mockGetCollectionBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetSizeBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetDesignerBreakdown).toHaveBeenCalledTimes(1);
    expect(mockGetGenreBreakdown).toHaveBeenCalledTimes(1);
  });
});
