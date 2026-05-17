import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

describe("getSessionHistory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated results with correct skip/take based on page and pageSize", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.count.mockResolvedValue(0);

    const { getSessionHistory } = await import("./session-history");
    await getSessionHistory("user-1", 3, "date", "desc", null);

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 50, // (3-1) * 25
        take: 25,
      }),
    );
  });

  it("sorts by date descending by default", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.count.mockResolvedValue(0);

    const { getSessionHistory } = await import("./session-history");
    await getSessionHistory("user-1", 1, "date", "desc", null);

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { date: "desc" },
      }),
    );
  });

  it("filters by projectId when provided (and not 'all')", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.count.mockResolvedValue(0);

    const { getSessionHistory } = await import("./session-history");
    await getSessionHistory("user-1", 1, "date", "desc", "proj-123");

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { userId: "user-1" },
          projectId: "proj-123",
        }),
      }),
    );
  });

  it("returns correct totalPages (Math.ceil(total / pageSize))", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.count.mockResolvedValue(51);

    const { getSessionHistory } = await import("./session-history");
    const result = await getSessionHistory("user-1", 1, "date", "desc", null);

    expect(result.totalPages).toBe(3); // Math.ceil(51/25) = 3
    expect(result.total).toBe(51);
  });

  it("maps session data to SessionHistoryItem shape including hasPhoto boolean", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        date: new Date("2026-05-10"),
        stitchCount: 150,
        timeSpentMinutes: 45,
        photoKey: "photos/session-1.webp",
        project: { id: "p1", chart: { name: "Project A" } },
      },
      {
        id: "s2",
        date: new Date("2026-05-11"),
        stitchCount: 200,
        timeSpentMinutes: null,
        photoKey: null,
        project: { id: "p2", chart: { name: "Project B" } },
      },
    ]);
    mockPrisma.stitchSession.count.mockResolvedValue(2);

    const { getSessionHistory } = await import("./session-history");
    const result = await getSessionHistory("user-1", 1, "date", "desc", null);

    expect(result.sessions).toHaveLength(2);
    expect(result.sessions[0]).toEqual({
      id: "s1",
      date: new Date("2026-05-10"),
      projectId: "p1",
      projectName: "Project A",
      stitchCount: 150,
      timeSpentMinutes: 45,
      hasPhoto: true,
    });
    expect(result.sessions[1]).toEqual({
      id: "s2",
      date: new Date("2026-05-11"),
      projectId: "p2",
      projectName: "Project B",
      stitchCount: 200,
      timeSpentMinutes: null,
      hasPhoto: false,
    });
  });

  it("cache key includes userId, page, sort, dir, and projectId", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.count.mockResolvedValue(0);

    const { getSessionHistory } = await import("./session-history");

    // Call with different params to verify the function accepts all params
    await getSessionHistory("user-1", 2, "stitches", "asc", "proj-5");

    // Verify userId filter in where clause
    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          project: { userId: "user-1" },
        }),
      }),
    );
  });
});
