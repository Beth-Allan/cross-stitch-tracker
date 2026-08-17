import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
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

// Mock timezone to return fixed timezone
vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  getCurrentPeriod: () => ({ year: 2026, month: 5 }),
}));

describe("getMonthlyTotals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 12 MonthlyTotal objects for a given year (one per month Jan-Dec)", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    const result = await getMonthlyTotals("user-1", 2026);

    expect(result).toHaveLength(12);
    expect(result[0].month).toBe("Jan");
    expect(result[11].month).toBe("Dec");
    expect(result[0].year).toBe(2026);
  });

  it("correctly buckets sessions into months based on timezone-aware dates", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([
      { date: new Date("2026-03-15T12:00:00.000Z"), _sum: { stitchCount: 500 } },
      { date: new Date("2026-03-20T12:00:00.000Z"), _sum: { stitchCount: 300 } },
      { date: new Date("2026-07-10T12:00:00.000Z"), _sum: { stitchCount: 1000 } },
    ]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    const result = await getMonthlyTotals("user-1", 2026);

    // March (index 2) = 500 + 300 = 800
    expect(result[2].month).toBe("Mar");
    expect(result[2].totalStitches).toBe(800);
    // July (index 6) = 1000
    expect(result[6].month).toBe("Jul");
    expect(result[6].totalStitches).toBe(1000);
  });

  it("returns 0 stitches for months with no sessions", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([
      { date: new Date("2026-01-15T12:00:00.000Z"), _sum: { stitchCount: 100 } },
    ]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    const result = await getMonthlyTotals("user-1", 2026);

    // February should be 0
    expect(result[1].month).toBe("Feb");
    expect(result[1].totalStitches).toBe(0);
  });

  it("cache key includes both userId and year parameters", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    await getMonthlyTotals("user-1", 2026);

    // Verify the groupBy was called with correct userId filter
    expect(mockPrisma.stitchSession.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { userId: "user-1" },
        }),
      }),
    );
  });

  it("uses 300s revalidate for the current year and 3600s for a past year", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);
    cacheOptions.length = 0;

    const { getMonthlyTotals } = await import("./monthly-totals");
    await getMonthlyTotals("user-1", 2026);
    await getMonthlyTotals("user-1", 2025);

    expect(cacheOptions[0]).toEqual({ tags: ["stats"], revalidate: 300 });
    expect(cacheOptions[1]).toEqual({ tags: ["stats"], revalidate: 3600 });
  });

  it("decides the current year in the user's timezone, not the server's", async () => {
    // getCurrentPeriod is mocked to 2026 -- a server clock already in 2027 must not
    // demote 2026 to a closed year while it is still 2026 for Beth
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);
    cacheOptions.length = 0;

    const { getMonthlyTotals } = await import("./monthly-totals");
    await getMonthlyTotals("user-1", 2026);

    expect(cacheOptions[0].revalidate).toBe(300);
  });
});

describe("getMonthlyTotals — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("counts a session dated the 1st in that month, not the previous one", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([
      { date: new Date("2026-05-01T00:00:00.000Z"), _sum: { stitchCount: 500 } },
    ]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    const result = await getMonthlyTotals("user-1", 2026);

    expect(result.find((m) => m.month === "May")!.totalStitches).toBe(500);
    expect(result.find((m) => m.month === "Apr")!.totalStitches).toBe(0);
  });

  it("queries the year with UTC-midnight bounds so January 1st is inside it", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    await getMonthlyTotals("user-1", 2026);

    expect(mockPrisma.stitchSession.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: {
            gte: new Date("2026-01-01T00:00:00.000Z"),
            lt: new Date("2027-01-01T00:00:00.000Z"),
          },
        }),
      }),
    );
  });

  it("counts a session dated January 1st in January", async () => {
    mockPrisma.stitchSession.groupBy.mockResolvedValue([
      { date: new Date("2026-01-01T00:00:00.000Z"), _sum: { stitchCount: 300 } },
    ]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    const result = await getMonthlyTotals("user-1", 2026);

    expect(result.find((m) => m.month === "Jan")!.totalStitches).toBe(300);
    expect(result.find((m) => m.month === "Dec")!.totalStitches).toBe(0);
  });
});
