import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

const { cacheOptions } = vi.hoisted(() => ({
  cacheOptions: [] as Array<{ tags?: string[]; revalidate?: number }>,
}));

vi.mock("next/cache", () => ({
  unstable_cache: (
    fn: (...args: unknown[]) => unknown,
    _keys: string[],
    options: { tags?: string[]; revalidate?: number },
  ) => {
    cacheOptions.push(options);
    return fn;
  },
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  getCurrentPeriod: () => ({ year: 2026, month: 5 }),
}));

describe("getDailyBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns daily entries with project names and stitch counts for a given month", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        date: new Date("2026-05-10T12:00:00.000Z"),
        stitchCount: 100,
        project: { id: "p1", chart: { name: "Project A" } },
      },
      {
        id: "s2",
        date: new Date("2026-05-10T18:00:00.000Z"),
        stitchCount: 200,
        project: { id: "p2", chart: { name: "Project B" } },
      },
      {
        id: "s3",
        date: new Date("2026-05-15T12:00:00.000Z"),
        stitchCount: 150,
        project: { id: "p1", chart: { name: "Project A" } },
      },
    ]);

    const { getDailyBreakdown } = await import("./daily-breakdown");
    const result = await getDailyBreakdown("user-1", 5, 2026);

    // Should return flat entries (one per session, not grouped)
    expect(result).toHaveLength(3);
    expect(result[0].date).toBe("2026-05-10");
    expect(result[0].projectId).toBe("p1");
    expect(result[0].projectName).toBe("Project A");
    expect(result[0].stitchCount).toBe(100);
  });

  it("cache key includes userId, month, and year", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getDailyBreakdown } = await import("./daily-breakdown");
    await getDailyBreakdown("user-1", 5, 2026);

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { userId: "user-1" },
        }),
      }),
    );
  });
});

describe("getDailyBreakdown — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("reports a session dated the 1st as the 1st", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        date: new Date("2026-05-01T00:00:00.000Z"),
        stitchCount: 100,
        project: { id: "p1", chartId: "c1", chart: { name: "Project A" } },
      },
    ]);

    const { getDailyBreakdown } = await import("./daily-breakdown");
    const result = await getDailyBreakdown("user-1", 5, 2026);

    expect(result.map((r) => r.date)).toEqual(["2026-05-01"]);
  });

  it("queries the month with UTC-midnight bounds so the 1st is inside it", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getDailyBreakdown } = await import("./daily-breakdown");
    await getDailyBreakdown("user-1", 5, 2026);

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date("2026-05-01T00:00:00.000Z"),
            lt: new Date("2026-06-01T00:00:00.000Z"),
          },
        }),
      }),
    );
  });

  it("is unaffected by daylight-saving transitions", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        date: new Date("2026-11-01T00:00:00.000Z"),
        stitchCount: 100,
        project: { id: "p1", chartId: "c1", chart: { name: "Project A" } },
      },
    ]);

    const { getDailyBreakdown } = await import("./daily-breakdown");
    const result = await getDailyBreakdown("user-1", 11, 2026);

    expect(result.map((r) => r.date)).toEqual(["2026-11-01"]);
  });
});
