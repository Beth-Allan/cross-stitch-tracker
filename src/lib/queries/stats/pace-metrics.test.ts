import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({
  unstable_cache: (fn: (...args: unknown[]) => unknown) => fn,
}));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Denver",
  getTodayCalendarDate: () => "2026-05-17",
}));

type DateWindow = { gte: Date; lt?: Date };

function aggregateWindows(): DateWindow[] {
  return mockPrisma.stitchSession.aggregate.mock.calls.map(
    (call: unknown[]) => (call[0] as { where: { date: DateWindow } }).where.date,
  );
}

function stubSevenAggregates() {
  mockPrisma.stitchSession.aggregate
    .mockResolvedValueOnce({ _sum: { stitchCount: 700 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 2500 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 5000, timeSpentMinutes: 1000 } })
    .mockResolvedValueOnce({ _sum: { stitchCount: 4000, timeSpentMinutes: 1000 } });
}

describe("getPaceMetrics", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns rolling averages (7/30/90-day) as stitches per day", async () => {
    // 7-day: 700 stitches / 7 = 100/day
    // 30-day: 3000 stitches / 30 = 100/day
    // 90-day: 9000 stitches / 90 = 100/day
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 700 } }) // 7-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } }) // 30-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } }) // 90-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 2500 } }) // this month
      .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } }) // last month
      .mockResolvedValueOnce({ _sum: { stitchCount: 5000, timeSpentMinutes: 1000 } }) // stitch rate recent
      .mockResolvedValueOnce({ _sum: { stitchCount: 4000, timeSpentMinutes: 1000 } }); // stitch rate prior

    const { getPaceMetrics } = await import("./pace-metrics");
    const result = await getPaceMetrics("user-1");

    expect(result.avg7Day).toBe(100);
    expect(result.avg30Day).toBe(100);
    expect(result.avg90Day).toBe(100);
  });

  it("thisMonthStitches and lastMonthStitches returned correctly", async () => {
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 700 } }) // 7-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } }) // 30-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } }) // 90-day
      .mockResolvedValueOnce({ _sum: { stitchCount: 4500 } }) // this month
      .mockResolvedValueOnce({ _sum: { stitchCount: 3200 } }) // last month
      .mockResolvedValueOnce({ _sum: { stitchCount: null, timeSpentMinutes: null } }) // stitch rate recent
      .mockResolvedValueOnce({ _sum: { stitchCount: null, timeSpentMinutes: null } }); // stitch rate prior

    const { getPaceMetrics } = await import("./pace-metrics");
    const result = await getPaceMetrics("user-1");

    expect(result.thisMonthStitches).toBe(4500);
    expect(result.lastMonthStitches).toBe(3200);
  });

  it("stitchRate is null when no sessions have timeSpentMinutes", async () => {
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 700 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2500 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: null, timeSpentMinutes: null } }) // no time data
      .mockResolvedValueOnce({ _sum: { stitchCount: null, timeSpentMinutes: null } }); // no time data

    const { getPaceMetrics } = await import("./pace-metrics");
    const result = await getPaceMetrics("user-1");

    expect(result.stitchRate).toBeNull();
  });

  it("stitchRate computed as round(totalStitches/totalMinutes*60) when time data exists", async () => {
    // 6000 stitches / 1000 minutes * 60 = 360 stitches/hr
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 700 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2500 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 6000, timeSpentMinutes: 1000 } }) // recent
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000, timeSpentMinutes: 600 } }); // prior

    const { getPaceMetrics } = await import("./pace-metrics");
    const result = await getPaceMetrics("user-1");

    expect(result.stitchRate).toBe(360); // 6000/1000*60 = 360
  });

  it("stitchRatePrior computed from prior 30-day window", async () => {
    // Prior: 3000 stitches / 600 minutes * 60 = 300 stitches/hr
    mockPrisma.stitchSession.aggregate
      .mockResolvedValueOnce({ _sum: { stitchCount: 700 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 9000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2500 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 2000 } })
      .mockResolvedValueOnce({ _sum: { stitchCount: 6000, timeSpentMinutes: 1000 } }) // recent
      .mockResolvedValueOnce({ _sum: { stitchCount: 3000, timeSpentMinutes: 600 } }); // prior

    const { getPaceMetrics } = await import("./pace-metrics");
    const result = await getPaceMetrics("user-1");

    expect(result.stitchRatePrior).toBe(300); // 3000/600*60 = 300
  });
});

describe("getPaceMetrics — window boundaries", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("windows the rolling averages over exactly 7, 30 and 90 calendar days ending today", async () => {
    stubSevenAggregates();

    const { getPaceMetrics } = await import("./pace-metrics");
    await getPaceMetrics("user-1");

    const windows = aggregateWindows();
    // today is 2026-05-17: a 7-day window starts 2026-05-11 and includes today
    expect(windows[0]).toEqual({ gte: new Date("2026-05-11T00:00:00.000Z") });
    expect(windows[1]).toEqual({ gte: new Date("2026-04-18T00:00:00.000Z") });
    expect(windows[2]).toEqual({ gte: new Date("2026-02-17T00:00:00.000Z") });
  });

  it("windows this month and last month on calendar month boundaries", async () => {
    stubSevenAggregates();

    const { getPaceMetrics } = await import("./pace-metrics");
    await getPaceMetrics("user-1");

    const windows = aggregateWindows();
    expect(windows[3]).toEqual({ gte: new Date("2026-05-01T00:00:00.000Z") });
    expect(windows[4]).toEqual({
      gte: new Date("2026-04-01T00:00:00.000Z"),
      lt: new Date("2026-05-01T00:00:00.000Z"),
    });
  });

  it("windows the stitch-rate comparison over two adjacent 30-day windows", async () => {
    stubSevenAggregates();

    const { getPaceMetrics } = await import("./pace-metrics");
    await getPaceMetrics("user-1");

    const windows = aggregateWindows();
    expect(windows[5]).toEqual({ gte: new Date("2026-04-18T00:00:00.000Z") });
    expect(windows[6]).toEqual({
      gte: new Date("2026-03-19T00:00:00.000Z"),
      lt: new Date("2026-04-18T00:00:00.000Z"),
    });
  });

  it("includes a session dated today in the 7-day window", async () => {
    stubSevenAggregates();

    const { getPaceMetrics } = await import("./pace-metrics");
    await getPaceMetrics("user-1");

    const sessionToday = new Date("2026-05-17T00:00:00.000Z");
    expect(sessionToday >= aggregateWindows()[0].gte).toBe(true);
  });

  it("only counts sessions with recorded time in the stitch-rate windows", async () => {
    stubSevenAggregates();

    const { getPaceMetrics } = await import("./pace-metrics");
    await getPaceMetrics("user-1");

    const calls = mockPrisma.stitchSession.aggregate.mock.calls;
    expect(calls[5][0].where.timeSpentMinutes).toEqual({ not: null });
    expect(calls[6][0].where.timeSpentMinutes).toEqual({ not: null });
  });
});
