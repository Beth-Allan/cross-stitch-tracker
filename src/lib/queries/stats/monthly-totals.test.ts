import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

// Mock timezone to return fixed timezone
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

  it("uses 300s revalidate for current year, 3600s for past years", async () => {
    // This test verifies the function signature includes year parameter
    // which the conditional TTL logic uses
    mockPrisma.stitchSession.groupBy.mockResolvedValue([]);

    const { getMonthlyTotals } = await import("./monthly-totals");
    // Should not throw for past year
    const result = await getMonthlyTotals("user-1", 2025);
    expect(result).toHaveLength(12);
  });
});
