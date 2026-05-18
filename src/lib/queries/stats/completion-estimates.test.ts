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

describe("getCompletionEstimates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns active projects with estimate when sufficient data exists", async () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = new Date();
    const firstSessionDate = new Date(now.getTime() - 30 * dayMs);

    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 3000,
        chart: { id: "c1", name: "Big Project", stitchCount: 10000 },
        sessions: [
          { date: firstSessionDate, stitchCount: 1000 },
          { date: new Date(now.getTime() - 20 * dayMs), stitchCount: 1000 },
          { date: new Date(now.getTime() - 10 * dayMs), stitchCount: 1000 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toHaveLength(1);
    expect(result[0].projectId).toBe("p1");
    expect(result[0].chartId).toBe("c1");
    expect(result[0].projectName).toBe("Big Project");
    expect(result[0].stitchesCompleted).toBe(3000);
    expect(result[0].totalStitches).toBe(10000);
    expect(result[0].percentComplete).toBe(30);
    expect(result[0].avgPerDay).toBeGreaterThan(0);
    expect(result[0].estimatedDate).toMatch(/^~[A-Z][a-z]{2} \d{4}$/);
  });

  it("excludes projects with fewer than 3 sessions", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 500,
        chart: { id: "c1", name: "Too Few Sessions", stitchCount: 5000 },
        sessions: [
          { date: new Date("2026-01-01"), stitchCount: 250 },
          { date: new Date("2026-01-02"), stitchCount: 250 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });

  it("excludes projects without chart.stitchCount (0)", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 500,
        chart: { id: "c1", name: "No Count", stitchCount: 0 },
        sessions: [
          { date: new Date("2026-01-01"), stitchCount: 100 },
          { date: new Date("2026-01-02"), stitchCount: 200 },
          { date: new Date("2026-01-03"), stitchCount: 200 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });

  it('formats estimated date as "~Mon YYYY"', async () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = new Date();

    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 5000,
        chart: { id: "c1", name: "Test", stitchCount: 10000 },
        sessions: [
          { date: new Date(now.getTime() - 100 * dayMs), stitchCount: 2000 },
          { date: new Date(now.getTime() - 50 * dayMs), stitchCount: 1500 },
          { date: new Date(now.getTime() - 10 * dayMs), stitchCount: 1500 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result[0].estimatedDate).toMatch(/^~[A-Z][a-z]{2} \d{4}$/);
  });

  it("sorts by soonest estimated date first", async () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const now = new Date();

    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 1000,
        chart: { id: "c1", name: "Far Away", stitchCount: 50000 },
        sessions: [
          { date: new Date(now.getTime() - 30 * dayMs), stitchCount: 300 },
          { date: new Date(now.getTime() - 20 * dayMs), stitchCount: 300 },
          { date: new Date(now.getTime() - 10 * dayMs), stitchCount: 400 },
        ],
      },
      {
        id: "p2",
        chartId: "c2",
        status: "IN_PROGRESS",
        stitchesCompleted: 4000,
        chart: { id: "c2", name: "Almost Done", stitchCount: 5000 },
        sessions: [
          { date: new Date(now.getTime() - 30 * dayMs), stitchCount: 1500 },
          { date: new Date(now.getTime() - 20 * dayMs), stitchCount: 1500 },
          { date: new Date(now.getTime() - 10 * dayMs), stitchCount: 1000 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toHaveLength(2);
    expect(result[0].projectName).toBe("Almost Done");
    expect(result[1].projectName).toBe("Far Away");
  });

  it("returns empty array when no active projects exist", async () => {
    mockPrisma.project.findMany.mockResolvedValue([]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });
});
