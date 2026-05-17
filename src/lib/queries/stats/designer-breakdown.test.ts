import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getDesignerBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty array when no charts with designers exist", async () => {
    mockPrisma.chart.groupBy.mockResolvedValue([]);

    const { getDesignerBreakdown } = await import("./designer-breakdown");
    const result = await getDesignerBreakdown("user-1");

    expect(result).toEqual([]);
  });

  it("returns designers sorted by chart count descending", async () => {
    mockPrisma.chart.groupBy.mockResolvedValue([
      { designerId: "d1", _count: { id: 10 } },
      { designerId: "d2", _count: { id: 5 } },
      { designerId: "d3", _count: { id: 2 } },
    ]);
    mockPrisma.designer.findMany.mockResolvedValue([
      { id: "d1", name: "Designer One" },
      { id: "d2", name: "Designer Two" },
      { id: "d3", name: "Designer Three" },
    ]);

    const { getDesignerBreakdown } = await import("./designer-breakdown");
    const result = await getDesignerBreakdown("user-1");

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ designerId: "d1", name: "Designer One", count: 10 });
    expect(result[1]).toEqual({ designerId: "d2", name: "Designer Two", count: 5 });
    expect(result[2]).toEqual({ designerId: "d3", name: "Designer Three", count: 2 });
  });

  it("respects limit parameter (default 10)", async () => {
    mockPrisma.chart.groupBy.mockResolvedValue([
      { designerId: "d1", _count: { id: 10 } },
    ]);
    mockPrisma.designer.findMany.mockResolvedValue([
      { id: "d1", name: "Designer One" },
    ]);

    const { getDesignerBreakdown } = await import("./designer-breakdown");
    await getDesignerBreakdown("user-1");

    // Verify groupBy was called with take: 10 (default limit)
    expect(mockPrisma.chart.groupBy).toHaveBeenCalledWith(
      expect.objectContaining({ take: 10 }),
    );
  });

  it("each item has designerId, name, and count fields", async () => {
    mockPrisma.chart.groupBy.mockResolvedValue([
      { designerId: "d1", _count: { id: 7 } },
    ]);
    mockPrisma.designer.findMany.mockResolvedValue([
      { id: "d1", name: "Test Designer" },
    ]);

    const { getDesignerBreakdown } = await import("./designer-breakdown");
    const result = await getDesignerBreakdown("user-1");

    expect(result[0]).toHaveProperty("designerId", "d1");
    expect(result[0]).toHaveProperty("name", "Test Designer");
    expect(result[0]).toHaveProperty("count", 7);
  });
});
