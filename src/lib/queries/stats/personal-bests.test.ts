import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));

describe("getPersonalBests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('returns 4 records (bestDay, bestSession, longestStreak, currentStreak) for "all" scope', async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    expect(result).toHaveLength(4);
    expect(result.map((r) => r.type)).toEqual([
      "bestDay",
      "bestSession",
      "longestStreak",
      "currentStreak",
    ]);
  });

  it("returns zero values and null links when no sessions exist", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    for (const record of result) {
      expect(record.value).toBe(0);
      expect(record.projectId).toBeNull();
      expect(record.chartId).toBeNull();
      expect(record.projectName).toBeNull();
    }
  });

  it("best day groups sessions by local date and returns max day total", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        projectId: "p1",
        date: new Date("2026-05-15T14:00:00Z"),
        stitchCount: 200,
        project: { chart: { id: "c1", name: "Project One" } },
      },
      {
        id: "s2",
        projectId: "p1",
        date: new Date("2026-05-15T20:00:00Z"),
        stitchCount: 300,
        project: { chart: { id: "c1", name: "Project One" } },
      },
      {
        id: "s3",
        projectId: "p2",
        date: new Date("2026-05-16T14:00:00Z"),
        stitchCount: 100,
        project: { chart: { id: "c2", name: "Project Two" } },
      },
    ]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const bestDay = result.find((r) => r.type === "bestDay")!;
    expect(bestDay.value).toBe(500);
    expect(bestDay.unit).toBe("stitches");
  });

  it("best session returns the single session with highest stitchCount", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        projectId: "p1",
        date: new Date("2026-05-15T14:00:00Z"),
        stitchCount: 200,
        project: { chart: { id: "c1", name: "Project One" } },
      },
      {
        id: "s2",
        projectId: "p1",
        date: new Date("2026-05-15T20:00:00Z"),
        stitchCount: 400,
        project: { chart: { id: "c1", name: "Project One" } },
      },
    ]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const bestSession = result.find((r) => r.type === "bestSession")!;
    expect(bestSession.value).toBe(400);
    expect(bestSession.unit).toBe("stitches");
    expect(bestSession.projectId).toBe("p1");
    expect(bestSession.chartId).toBe("c1");
    expect(bestSession.projectName).toBe("Project One");
  });

  it("calculates longest streak from consecutive days (3 consecutive = 3)", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        projectId: "p1",
        date: new Date("2026-05-13T14:00:00Z"),
        stitchCount: 100,
        project: { chart: { id: "c1", name: "P1" } },
      },
      {
        id: "s2",
        projectId: "p1",
        date: new Date("2026-05-14T14:00:00Z"),
        stitchCount: 100,
        project: { chart: { id: "c1", name: "P1" } },
      },
      {
        id: "s3",
        projectId: "p1",
        date: new Date("2026-05-15T14:00:00Z"),
        stitchCount: 100,
        project: { chart: { id: "c1", name: "P1" } },
      },
      {
        id: "s4",
        projectId: "p1",
        date: new Date("2026-05-17T14:00:00Z"),
        stitchCount: 100,
        project: { chart: { id: "c1", name: "P1" } },
      },
    ]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const longestStreak = result.find((r) => r.type === "longestStreak")!;
    expect(longestStreak.value).toBe(3);
    expect(longestStreak.unit).toBe("days");
  });

  it("current streak returns 0 when most recent session > 1 day ago", async () => {
    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 3);

    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        projectId: "p1",
        date: twoDaysAgo,
        stitchCount: 100,
        project: { chart: { id: "c1", name: "P1" } },
      },
    ]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const currentStreak = result.find((r) => r.type === "currentStreak")!;
    expect(currentStreak.value).toBe(0);
  });

  it("year-scoped returns null/0 for current streak", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "2026");

    const currentStreak = result.find((r) => r.type === "currentStreak")!;
    expect(currentStreak.value).toBe(0);
    expect(currentStreak.date).toBeNull();
  });

  it('"2026" scope applies date boundaries to session query', async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    await getPersonalBests("user-1", "2026");

    expect(mockPrisma.stitchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          date: expect.objectContaining({
            gte: expect.any(Date),
            lt: expect.any(Date),
          }),
        }),
      }),
    );
  });
});
