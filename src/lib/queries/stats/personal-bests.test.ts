import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";
import type { ProjectLinkedRecord, PersonalBestRecord } from "@/types/stats";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

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

const { cacheOptions } = vi.hoisted(() => ({
  cacheOptions: [] as Array<{ tags?: string[]; revalidate?: number }>,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
  getTodayCalendarDate: () => "2026-05-17",
  getCurrentPeriod: () => ({ year: 2026, month: 5 }),
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

  it("returns zero values when no sessions exist", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);
    mockPrisma.stitchSession.findFirst.mockResolvedValue(null);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    for (const record of result) {
      expect(record.value).toBe(0);
    }

    const isProjectLinked = (r: PersonalBestRecord): r is ProjectLinkedRecord =>
      r.type === "bestDay" || r.type === "bestSession";
    const projectLinked = result.filter(isProjectLinked);
    for (const record of projectLinked) {
      expect(record.projectId).toBeUndefined();
      expect(record.chartId).toBeUndefined();
      expect(record.projectName).toBeUndefined();
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
    expect(bestSession).toMatchObject({
      projectId: "p1",
      chartId: "c1",
      projectName: "Project One",
    });
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
    // getTodayCalendarDate is mocked to 2026-05-17
    const threeDaysAgo = new Date("2026-05-14T00:00:00.000Z");

    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        id: "s1",
        projectId: "p1",
        date: threeDaysAgo,
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

describe("getPersonalBests — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
    cacheOptions.length = 0;
  });

  const session = (id: string, date: string, stitchCount: number) => ({
    id,
    projectId: "p1",
    date: new Date(`${date}T00:00:00.000Z`),
    stitchCount,
    project: { chart: { id: "c1", name: "Project A" } },
  });

  it("dates the best day by its stored calendar date, not the previous local day", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([session("s1", "2026-05-01", 900)]);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const bestDay = result.find((r) => r.type === "bestDay") as ProjectLinkedRecord;
    expect(bestDay.date).toBe("2026-05-01");
  });

  it("dates the best session by its stored calendar date", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([session("s1", "2026-03-08", 900)]);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    const bestSession = result.find((r) => r.type === "bestSession") as ProjectLinkedRecord;
    expect(bestSession.date).toBe("2026-03-08");
  });

  it("counts consecutive calendar days as a streak across a DST transition", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      session("s1", "2026-03-07", 100),
      session("s2", "2026-03-08", 100),
      session("s3", "2026-03-09", 100),
    ]);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    expect(result.find((r) => r.type === "longestStreak")!.value).toBe(3);
  });

  it("counts a current streak that runs up to today", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      session("s1", "2026-05-15", 100),
      session("s2", "2026-05-16", 100),
      session("s3", "2026-05-17", 100),
    ]);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    expect(result.find((r) => r.type === "currentStreak")!.value).toBe(3);
  });

  it("breaks the current streak when the last session is more than a day old", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      session("s1", "2026-05-14", 100),
      session("s2", "2026-05-15", 100),
    ]);

    const { getPersonalBests } = await import("./personal-bests");
    const result = await getPersonalBests("user-1", "all");

    expect(result.find((r) => r.type === "currentStreak")!.value).toBe(0);
  });

  it("uses 300s revalidate for the current year and 3600s for a past year", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getPersonalBests } = await import("./personal-bests");
    await getPersonalBests("user-1", "2026");
    await getPersonalBests("user-1", "2025");

    expect(cacheOptions[0]).toEqual({ tags: ["stats"], revalidate: 300 });
    expect(cacheOptions[1]).toEqual({ tags: ["stats"], revalidate: 3600 });
  });
});
