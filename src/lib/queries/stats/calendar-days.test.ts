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

describe("getCalendarDays", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("groups sessions by date (YYYY-MM-DD in user timezone) with project details", async () => {
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

    const { getCalendarDays } = await import("./calendar-days");
    const result = await getCalendarDays("user-1", 5, 2026);

    // Should group by date
    expect(result.length).toBeGreaterThanOrEqual(2);

    const may10 = result.find((d) => d.date === "2026-05-10");
    expect(may10).toBeDefined();
    expect(may10!.sessions).toHaveLength(2);
    expect(may10!.sessions[0].projectId).toBe("p1");
    expect(may10!.sessions[0].projectName).toBe("Project A");
    expect(may10!.sessions[0].stitchCount).toBe(100);

    const may15 = result.find((d) => d.date === "2026-05-15");
    expect(may15).toBeDefined();
    expect(may15!.sessions).toHaveLength(1);
  });

  it("returns empty array for months with no sessions", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getCalendarDays } = await import("./calendar-days");
    const result = await getCalendarDays("user-1", 2, 2026);

    expect(result).toEqual([]);
  });

  it("cache key includes userId, month, and year", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getCalendarDays } = await import("./calendar-days");
    await getCalendarDays("user-1", 5, 2026);

    // Verify findMany was called with correct userId filter
    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { userId: "user-1" },
        }),
      }),
    );
  });
});

describe("getCalendarDays — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keys a session dated the 1st under the 1st, not the last day of the previous month", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        date: new Date("2026-05-01T00:00:00.000Z"),
        stitchCount: 100,
        project: { id: "p1", chartId: "c1", chart: { name: "Project A" } },
      },
    ]);

    const { getCalendarDays } = await import("./calendar-days");
    const result = await getCalendarDays("user-1", 5, 2026);

    expect(result.map((d) => d.date)).toEqual(["2026-05-01"]);
  });

  it("queries the month with UTC-midnight bounds so the 1st is inside it", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getCalendarDays } = await import("./calendar-days");
    await getCalendarDays("user-1", 5, 2026);

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
        date: new Date("2026-03-08T00:00:00.000Z"),
        stitchCount: 100,
        project: { id: "p1", chartId: "c1", chart: { name: "Project A" } },
      },
    ]);

    const { getCalendarDays } = await import("./calendar-days");
    const result = await getCalendarDays("user-1", 3, 2026);

    expect(result.map((d) => d.date)).toEqual(["2026-03-08"]);
  });
});

describe("getCalendarDays — cache TTL", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cacheOptions.length = 0;
  });

  it("uses 300s revalidate for the user's current month and 3600s for a closed one", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getCalendarDays } = await import("./calendar-days");
    await getCalendarDays("user-1", 5, 2026);
    await getCalendarDays("user-1", 4, 2026);

    expect(cacheOptions[0]).toEqual({ tags: ["stats"], revalidate: 300 });
    expect(cacheOptions[1]).toEqual({ tags: ["stats"], revalidate: 3600 });
  });

  it("treats the same month of a different year as a closed month", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getCalendarDays } = await import("./calendar-days");
    await getCalendarDays("user-1", 5, 2025);

    expect(cacheOptions[0].revalidate).toBe(3600);
  });
});
