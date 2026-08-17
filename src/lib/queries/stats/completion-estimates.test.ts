import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
  getTodayCalendarDate: () => "2026-05-17",
  getCurrentPeriod: () => ({ year: 2026, month: 5 }),
}));

// getTodayCalendarDate is mocked to 2026-05-17, so fixtures are anchored to that date
const TODAY_MS = new Date("2026-05-17T00:00:00.000Z").getTime();
const daysBeforeToday = (n: number) => new Date(TODAY_MS - n * 24 * 60 * 60 * 1000);

describe("getCompletionEstimates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns active projects with estimate when sufficient data exists", async () => {
    const firstSessionDate = daysBeforeToday(30);

    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 3000,
        chart: { id: "c1", name: "Big Project", stitchCount: 10000 },
        sessions: [
          { date: firstSessionDate, stitchCount: 1000 },
          { date: daysBeforeToday(20), stitchCount: 1000 },
          { date: daysBeforeToday(10), stitchCount: 1000 },
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
    // 3000 stitches over the 30 calendar days since the first session
    expect(result[0].avgPerDay).toBe(100);
    // 7000 remaining / 100 per day = 70 days; 2026-05-17 + 70 days = 2026-07-26
    expect(result[0].estimatedDate).toBe("Jul 2026");
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
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 5000,
        chart: { id: "c1", name: "Test", stitchCount: 10000 },
        sessions: [
          { date: daysBeforeToday(100), stitchCount: 2000 },
          { date: daysBeforeToday(50), stitchCount: 1500 },
          { date: daysBeforeToday(10), stitchCount: 1500 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result[0].estimatedDate).toMatch(/^[A-Z][a-z]{2} \d{4}$/);
  });

  it("sorts by soonest estimated date first", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 1000,
        chart: { id: "c1", name: "Far Away", stitchCount: 50000 },
        sessions: [
          { date: daysBeforeToday(30), stitchCount: 300 },
          { date: daysBeforeToday(20), stitchCount: 300 },
          { date: daysBeforeToday(10), stitchCount: 400 },
        ],
      },
      {
        id: "p2",
        chartId: "c2",
        status: "IN_PROGRESS",
        stitchesCompleted: 4000,
        chart: { id: "c2", name: "Almost Done", stitchCount: 5000 },
        sessions: [
          { date: daysBeforeToday(30), stitchCount: 1500 },
          { date: daysBeforeToday(20), stitchCount: 1500 },
          { date: daysBeforeToday(10), stitchCount: 1000 },
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

  it("excludes projects where stitchesCompleted equals totalStitches (100% complete)", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 5000,
        chart: { id: "c1", name: "Fully Done", stitchCount: 5000 },
        sessions: [
          { date: daysBeforeToday(30), stitchCount: 2000 },
          { date: daysBeforeToday(20), stitchCount: 2000 },
          { date: daysBeforeToday(10), stitchCount: 1000 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });

  it("excludes projects where stitchesCompleted exceeds totalStitches (over 100%)", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 5500,
        chart: { id: "c1", name: "Over-stitched", stitchCount: 5000 },
        sessions: [
          { date: daysBeforeToday(30), stitchCount: 2000 },
          { date: daysBeforeToday(20), stitchCount: 2000 },
          { date: daysBeforeToday(10), stitchCount: 1500 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    expect(result).toEqual([]);
  });
});

describe("getProjectCompletionEstimate", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns single estimate for a project with sufficient data", async () => {
    const firstSessionDate = daysBeforeToday(30);

    mockPrisma.project.findUnique.mockResolvedValue({
      id: "p1",
      chartId: "c1",
      status: "IN_PROGRESS",
      stitchesCompleted: 3000,
      chart: { id: "c1", name: "Big Project", stitchCount: 10000 },
      sessions: [
        { date: firstSessionDate, stitchCount: 1000 },
        { date: daysBeforeToday(20), stitchCount: 1000 },
        { date: daysBeforeToday(10), stitchCount: 1000 },
      ],
    });

    const { getProjectCompletionEstimate } = await import("./completion-estimates");
    const result = await getProjectCompletionEstimate("user-1", "p1");

    expect(result).not.toBeNull();
    expect(result!.projectId).toBe("p1");
    expect(result!.chartId).toBe("c1");
    expect(result!.projectName).toBe("Big Project");
    expect(result!.percentComplete).toBe(30);
    expect(result!.avgPerDay).toBe(100);
    expect(result!.estimatedDate).toBe("Jul 2026");
  });

  it("returns null when project has no target stitches", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
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
    });

    const { getProjectCompletionEstimate } = await import("./completion-estimates");
    const result = await getProjectCompletionEstimate("user-1", "p1");

    expect(result).toBeNull();
  });

  it("returns null when project has fewer than 3 sessions", async () => {
    mockPrisma.project.findUnique.mockResolvedValue({
      id: "p1",
      chartId: "c1",
      status: "IN_PROGRESS",
      stitchesCompleted: 500,
      chart: { id: "c1", name: "Too Few", stitchCount: 5000 },
      sessions: [
        { date: new Date("2026-01-01"), stitchCount: 250 },
        { date: new Date("2026-01-02"), stitchCount: 250 },
      ],
    });

    const { getProjectCompletionEstimate } = await import("./completion-estimates");
    const result = await getProjectCompletionEstimate("user-1", "p1");

    expect(result).toBeNull();
  });

  it("returns null when project not found", async () => {
    mockPrisma.project.findUnique.mockResolvedValue(null);

    const { getProjectCompletionEstimate } = await import("./completion-estimates");
    const result = await getProjectCompletionEstimate("user-1", "p-nonexistent");

    expect(result).toBeNull();
  });
});

describe("getCompletionEstimates — calendar-date convention", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("counts the days since the first session on calendar dates, DST included", async () => {
    mockPrisma.project.findMany.mockResolvedValue([
      {
        id: "p1",
        chartId: "c1",
        status: "IN_PROGRESS",
        stitchesCompleted: 300,
        chart: { id: "c1", name: "Big Project", stitchCount: 1300 },
        sessions: [
          { date: new Date("2026-03-08T00:00:00.000Z"), stitchCount: 100 },
          { date: new Date("2026-03-09T00:00:00.000Z"), stitchCount: 100 },
          { date: new Date("2026-03-10T00:00:00.000Z"), stitchCount: 100 },
        ],
      },
    ]);

    const { getCompletionEstimates } = await import("./completion-estimates");
    const result = await getCompletionEstimates("user-1", "all");

    // 2026-03-08 to 2026-05-17 is 70 calendar days; 300 stitches / 70 days
    expect(result[0].avgPerDay).toBe(4.3);
  });
});
