import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock timezone to return fixed boundaries
vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  getLocalDayBoundaries: () => ({
    todayStart: new Date("2026-05-17T06:00:00.000Z"),
    todayEnd: new Date("2026-05-18T05:59:59.999Z"),
    weekStart: new Date("2026-05-11T06:00:00.000Z"),
    monthStart: new Date("2026-05-01T06:00:00.000Z"),
    yearStart: new Date("2026-01-01T07:00:00.000Z"),
  }),
}));

describe("getHeroStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns zero counts when no sessions exist", async () => {
    // All aggregates return null sums
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null, timeSpentMinutes: null },
      _count: { id: 0 },
    });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result).toEqual({
      stitchesToday: 0,
      stitchesThisWeek: 0,
      stitchesThisMonth: 0,
      stitchesThisYear: 0,
      totalLifetimeStitches: 0,
      totalSessions: 0,
      totalTimeMinutes: 0,
      projectsCompleted: 0,
      collectionTotalStitches: 0,
    });
  });

  it("returns correct stitch counts for each time window", async () => {
    // Mock: today=100, week=500, month=2000, year=8000, lifetime=15000
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 100 } }) // today
      .mockResolvedValueOnce({ _sum: { stitchCount: 500 } }) // week
      .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } }) // month
      .mockResolvedValueOnce({ _sum: { stitchCount: 8000 } }) // year
      .mockResolvedValueOnce({
        _sum: { stitchCount: 15000, timeSpentMinutes: 3000 },
        _count: { id: 42 },
      }); // lifetime
    mockPrisma.project.count.mockResolvedValue(3);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: 500000 },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.stitchesToday).toBe(100);
    expect(result.stitchesThisWeek).toBe(500);
    expect(result.stitchesThisMonth).toBe(2000);
    expect(result.stitchesThisYear).toBe(8000);
    expect(result.totalLifetimeStitches).toBe(15000);
  });

  it("returns totalSessions from lifetime aggregate _count.id", async () => {
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({
        _sum: { stitchCount: 5000, timeSpentMinutes: 600 },
        _count: { id: 25 },
      });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.totalSessions).toBe(25);
  });

  it("returns totalTimeMinutes from lifetime aggregate _sum.timeSpentMinutes", async () => {
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null } })
      .mockResolvedValueOnce({
        _sum: { stitchCount: 0, timeSpentMinutes: 1440 },
        _count: { id: 10 },
      });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.totalTimeMinutes).toBe(1440);
  });

  it("returns projectsCompleted count from project.count with FINISHED+FFO filter", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null, timeSpentMinutes: null },
      _count: { id: 0 },
    });
    mockPrisma.project.count.mockResolvedValue(7);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.projectsCompleted).toBe(7);
    expect(mockPrisma.project.count).toHaveBeenCalledWith({
      where: { userId: "user-1", status: { in: ["FINISHED", "FFO"] } },
    });
  });

  it("returns collectionTotalStitches from chart.aggregate sum", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null, timeSpentMinutes: null },
      _count: { id: 0 },
    });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: 500000 },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.collectionTotalStitches).toBe(500000);
    expect(mockPrisma.chart.aggregate).toHaveBeenCalledWith({
      where: { projects: { some: { userId: "user-1" } } },
      _sum: { stitchCount: true },
    });
  });

  it("defaults collectionTotalStitches to 0 when aggregate returns null", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null, timeSpentMinutes: null },
      _count: { id: 0 },
    });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    const result = await getHeroStats("user-1");

    expect(result.collectionTotalStitches).toBe(0);
  });

  it("passes timezone-aware date boundaries to Prisma WHERE clauses", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: null, timeSpentMinutes: null },
      _count: { id: 0 },
    });
    mockPrisma.project.count.mockResolvedValue(0);
    mockPrisma.chart.aggregate.mockResolvedValue({
      _sum: { stitchCount: null },
    });

    const { getHeroStats } = await import("./hero-stats");
    await getHeroStats("user-1");

    // Today aggregate should use todayStart and todayEnd
    const todayCall = mockPrisma.stitchSession.aggregate.mock.calls[0][0];
    expect(todayCall.where.date.gte).toEqual(new Date("2026-05-17T06:00:00.000Z"));
    expect(todayCall.where.date.lt).toEqual(new Date("2026-05-18T05:59:59.999Z"));

    // Week aggregate uses weekStart
    const weekCall = mockPrisma.stitchSession.aggregate.mock.calls[1][0];
    expect(weekCall.where.date.gte).toEqual(new Date("2026-05-11T06:00:00.000Z"));

    // Month aggregate uses monthStart
    const monthCall = mockPrisma.stitchSession.aggregate.mock.calls[2][0];
    expect(monthCall.where.date.gte).toEqual(new Date("2026-05-01T06:00:00.000Z"));

    // Year aggregate uses yearStart
    const yearCall = mockPrisma.stitchSession.aggregate.mock.calls[3][0];
    expect(yearCall.where.date.gte).toEqual(new Date("2026-01-01T07:00:00.000Z"));
  });
});
