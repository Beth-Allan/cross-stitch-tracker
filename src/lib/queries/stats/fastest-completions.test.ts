import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
  getCurrentPeriod: () => ({ year: 2026, month: 5 }),
}));

describe("getFastestCompletions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty array when no FINISHED/FFO projects exist", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result).toEqual([]);
  });

  it("returns fastest per size category", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "FINISHED",
        startDate: new Date("2026-01-01"),
        finishDate: new Date("2026-01-11"),
        chart: {
          id: "c1",
          name: "Small Project",
          stitchCount: 3000,
          stitchesWide: 0,
          stitchesHigh: 0,
        },
        sessions: [],
      },
      {
        id: "p2",
        chartId: "c2",
        status: "FFO",
        startDate: new Date("2026-01-01"),
        finishDate: new Date("2026-02-01"),
        chart: {
          id: "c2",
          name: "Medium Project",
          stitchCount: 10000,
          stitchesWide: 0,
          stitchesHigh: 0,
        },
        sessions: [],
      },
      {
        id: "p3",
        chartId: "c3",
        status: "FINISHED",
        startDate: new Date("2026-01-01"),
        finishDate: new Date("2026-01-20"),
        chart: {
          id: "c3",
          name: "Faster Medium",
          stitchCount: 8000,
          stitchesWide: 0,
          stitchesHigh: 0,
        },
        sessions: [],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result.length).toBeGreaterThanOrEqual(2);

    const small = result.find((r) => r.sizeCategory === "Small");
    expect(small).toBeDefined();
    expect(small!.daysToComplete).toBe(10);
    expect(small!.projectName).toBe("Small Project");

    const medium = result.find((r) => r.sizeCategory === "Medium");
    expect(medium).toBeDefined();
    expect(medium!.daysToComplete).toBe(19);
    expect(medium!.projectName).toBe("Faster Medium");
  });

  it("uses first session date as fallback when startDate is null", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "FINISHED",
        startDate: null,
        finishDate: new Date("2026-01-21"),
        chart: { id: "c1", name: "No Start", stitchCount: 3000, stitchesWide: 0, stitchesHigh: 0 },
        sessions: [{ date: new Date("2026-01-11") }, { date: new Date("2026-01-15") }],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result).toHaveLength(1);
    expect(result[0].daysToComplete).toBe(10);
  });

  it("excludes projects missing both startDate and sessions", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "FINISHED",
        startDate: null,
        finishDate: new Date("2026-01-21"),
        chart: {
          id: "c1",
          name: "No Start Or Sessions",
          stitchCount: 3000,
          stitchesWide: 0,
          stitchesHigh: 0,
        },
        sessions: [],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result).toEqual([]);
  });

  it("excludes projects without finishDate", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "FINISHED",
        startDate: new Date("2026-01-01"),
        finishDate: null,
        chart: { id: "c1", name: "No Finish", stitchCount: 3000, stitchesWide: 0, stitchesHigh: 0 },
        sessions: [],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result).toEqual([]);
  });
});

describe("getFastestCompletions — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("reports start and finish by their stored calendar dates", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        startDate: new Date("2026-05-01T00:00:00.000Z"),
        finishDate: new Date("2026-05-11T00:00:00.000Z"),
        stitchesCompleted: 1000,
        chart: {
          id: "c1",
          name: "Small One",
          stitchCount: 2000,
          stitchesWide: 50,
          stitchesHigh: 40,
        },
        sessions: [],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result[0].startDate).toBe("2026-05-01");
    expect(result[0].finishDate).toBe("2026-05-11");
    expect(result[0].daysToComplete).toBe(10);
  });

  it("counts days across a DST transition exactly", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        startDate: new Date("2026-03-07T00:00:00.000Z"),
        finishDate: new Date("2026-03-09T00:00:00.000Z"),
        stitchesCompleted: 1000,
        chart: {
          id: "c1",
          name: "Small One",
          stitchCount: 2000,
          stitchesWide: 50,
          stitchesHigh: 40,
        },
        sessions: [],
      },
    ]);

    const { getFastestCompletions } = await import("./fastest-completions");
    const result = await getFastestCompletions("user-1", "all");

    expect(result[0].daysToComplete).toBe(2);
  });
});
