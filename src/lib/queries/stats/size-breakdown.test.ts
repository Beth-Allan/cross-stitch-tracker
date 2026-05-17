import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getSizeBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 5 items in order [Mini, Small, Medium, Large, BAP] when charts exist", async () => {
    mockPrisma.chart.findMany.mockResolvedValue([
      { stitchCount: 500, stitchesWide: 0, stitchesHigh: 0 },
      { stitchCount: 2000, stitchesWide: 0, stitchesHigh: 0 },
      { stitchCount: 10000, stitchesWide: 0, stitchesHigh: 0 },
      { stitchCount: 30000, stitchesWide: 0, stitchesHigh: 0 },
      { stitchCount: 60000, stitchesWide: 0, stitchesHigh: 0 },
    ]);

    const { getSizeBreakdown } = await import("./size-breakdown");
    const result = await getSizeBreakdown("user-1");

    expect(result).toHaveLength(5);
    expect(result.map((r) => r.category)).toEqual(["Mini", "Small", "Medium", "Large", "BAP"]);
  });

  it("returns all zeroes when no charts exist", async () => {
    mockPrisma.chart.findMany.mockResolvedValue([]);

    const { getSizeBreakdown } = await import("./size-breakdown");
    const result = await getSizeBreakdown("user-1");

    expect(result).toHaveLength(5);
    result.forEach((item) => {
      expect(item.count).toBe(0);
    });
  });

  it("correctly buckets charts using calculateSizeCategory thresholds", async () => {
    mockPrisma.chart.findMany.mockResolvedValue([
      { stitchCount: 500, stitchesWide: 0, stitchesHigh: 0 }, // Mini (<1000)
      { stitchCount: 2000, stitchesWide: 0, stitchesHigh: 0 }, // Small (1000-4999)
      { stitchCount: 10000, stitchesWide: 0, stitchesHigh: 0 }, // Medium (5000-24999)
      { stitchCount: 30000, stitchesWide: 0, stitchesHigh: 0 }, // Large (25000-49999)
      { stitchCount: 60000, stitchesWide: 0, stitchesHigh: 0 }, // BAP (>=50000)
    ]);

    const { getSizeBreakdown } = await import("./size-breakdown");
    const result = await getSizeBreakdown("user-1");

    expect(result.find((r) => r.category === "Mini")!.count).toBe(1);
    expect(result.find((r) => r.category === "Small")!.count).toBe(1);
    expect(result.find((r) => r.category === "Medium")!.count).toBe(1);
    expect(result.find((r) => r.category === "Large")!.count).toBe(1);
    expect(result.find((r) => r.category === "BAP")!.count).toBe(1);
  });

  it("uses getEffectiveStitchCount fallback (stitchCount=0, dimensions present)", async () => {
    mockPrisma.chart.findMany.mockResolvedValue([
      { stitchCount: 0, stitchesWide: 100, stitchesHigh: 100 }, // 10000 -> Medium
    ]);

    const { getSizeBreakdown } = await import("./size-breakdown");
    const result = await getSizeBreakdown("user-1");

    expect(result.find((r) => r.category === "Medium")!.count).toBe(1);
  });

  it("each item has fill property from sizeCategoryConfig", async () => {
    mockPrisma.chart.findMany.mockResolvedValue([
      { stitchCount: 500, stitchesWide: 0, stitchesHigh: 0 },
    ]);

    const { getSizeBreakdown } = await import("./size-breakdown");
    const result = await getSizeBreakdown("user-1");

    expect(result[0].fill).toBe("var(--chart-1)"); // Mini
    expect(result[1].fill).toBe("var(--chart-2)"); // Small
    expect(result[2].fill).toBe("var(--chart-3)"); // Medium
    expect(result[3].fill).toBe("var(--chart-4)"); // Large
    expect(result[4].fill).toBe("var(--chart-5)"); // BAP
  });
});
