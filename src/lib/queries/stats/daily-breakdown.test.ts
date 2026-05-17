import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
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
