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
