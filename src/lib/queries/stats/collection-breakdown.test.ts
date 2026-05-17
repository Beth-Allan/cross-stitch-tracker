import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

// Bypass unstable_cache -- make it transparent
vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getCollectionBreakdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns empty byStatus array and totalProjects=0 when no projects exist", async () => {
    mockPrisma.project.groupBy.mockResolvedValue([]);

    const { getCollectionBreakdown } = await import("./collection-breakdown");
    const result = await getCollectionBreakdown("user-1");

    expect(result.totalProjects).toBe(0);
    // All 7 statuses present with count 0
    expect(result.byStatus).toHaveLength(7);
    result.byStatus.forEach((item) => {
      expect(item.count).toBe(0);
    });
  });

  it("maps Prisma groupBy results to StatusBreakdownItem with correct fill colors", async () => {
    mockPrisma.project.groupBy.mockResolvedValue([
      { status: "IN_PROGRESS", _count: { id: 5 } },
      { status: "FINISHED", _count: { id: 3 } },
    ]);

    const { getCollectionBreakdown } = await import("./collection-breakdown");
    const result = await getCollectionBreakdown("user-1");

    const inProgress = result.byStatus.find((s) => s.status === "IN_PROGRESS");
    expect(inProgress).toBeDefined();
    expect(inProgress!.count).toBe(5);
    expect(inProgress!.fill).toBe("var(--status-in-progress)");

    const finished = result.byStatus.find((s) => s.status === "FINISHED");
    expect(finished).toBeDefined();
    expect(finished!.count).toBe(3);
    expect(finished!.fill).toBe("var(--status-finished)");
  });

  it("returns correct totalProjects as sum of all status counts", async () => {
    mockPrisma.project.groupBy.mockResolvedValue([
      { status: "IN_PROGRESS", _count: { id: 5 } },
      { status: "FINISHED", _count: { id: 3 } },
      { status: "UNSTARTED", _count: { id: 10 } },
    ]);

    const { getCollectionBreakdown } = await import("./collection-breakdown");
    const result = await getCollectionBreakdown("user-1");

    expect(result.totalProjects).toBe(18);
  });

  it("includes all 7 statuses even when some have 0 count", async () => {
    mockPrisma.project.groupBy.mockResolvedValue([{ status: "IN_PROGRESS", _count: { id: 2 } }]);

    const { getCollectionBreakdown } = await import("./collection-breakdown");
    const result = await getCollectionBreakdown("user-1");

    expect(result.byStatus).toHaveLength(7);

    const allStatuses = [
      "UNSTARTED",
      "KITTING",
      "KITTED",
      "IN_PROGRESS",
      "ON_HOLD",
      "FINISHED",
      "FFO",
    ];
    const returnedStatuses = result.byStatus.map((item) => item.status);
    expect(returnedStatuses).toEqual(allStatuses);

    // IN_PROGRESS has count 2, all others have 0
    const inProgress = result.byStatus.find((s) => s.status === "IN_PROGRESS");
    expect(inProgress!.count).toBe(2);

    const zeroStatuses = result.byStatus.filter((s) => s.status !== "IN_PROGRESS");
    zeroStatuses.forEach((item) => {
      expect(item.count).toBe(0);
    });
  });
});
