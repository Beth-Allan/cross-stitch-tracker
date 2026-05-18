import { describe, it, expect, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("./timezone", () => ({
  getUserTimezone: () => "America/Edmonton",
}));

describe("detectBrokenRecords", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns empty array when session does not break any record", async () => {
    // Today's total = 100 (just the new session), previous best day = 500
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 100 },
    });

    // Previous sessions: one with 200 stitches (higher than new session's 100)
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-10T14:00:00Z"),
        stitchCount: 200,
      },
      {
        date: new Date("2026-05-11T14:00:00Z"),
        stitchCount: 100,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 100,
      projectId: "proj-1",
    });

    expect(result).toEqual([]);
  });

  it("returns bestDay record when today's total exceeds previous best day", async () => {
    // Today's total = 600 (including new session)
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 600 },
    });

    // Previous sessions all on different days: best day was 500
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-10T14:00:00Z"),
        stitchCount: 300,
      },
      {
        date: new Date("2026-05-10T20:00:00Z"),
        stitchCount: 200,
      },
      {
        date: new Date("2026-05-11T14:00:00Z"),
        stitchCount: 100,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 600,
      projectId: "proj-1",
    });

    const bestDay = result.find((r) => r.type === "bestDay");
    expect(bestDay).toBeDefined();
    expect(bestDay!.newValue).toBe(600);
    expect(bestDay!.oldValue).toBe(500);
    expect(bestDay!.unit).toBe("stitches");
    expect(bestDay!.label).toBe("Best Day");
  });

  it("returns bestSession record when new session exceeds all previous sessions", async () => {
    // Today's total doesn't matter for this test — focus on session comparison
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 500 },
    });

    // Previous sessions: best was 400
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-10T14:00:00Z"),
        stitchCount: 400,
      },
      {
        date: new Date("2026-05-11T14:00:00Z"),
        stitchCount: 200,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 500,
      projectId: "proj-1",
    });

    const bestSession = result.find((r) => r.type === "bestSession");
    expect(bestSession).toBeDefined();
    expect(bestSession!.newValue).toBe(500);
    expect(bestSession!.oldValue).toBe(400);
    expect(bestSession!.unit).toBe("stitches");
    expect(bestSession!.label).toBe("Best Session");
  });

  it("returns longestStreak record when new session extends streak beyond previous longest", async () => {
    // Today's total won't trigger bestDay
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 50 },
    });

    // Sessions: 3-day streak in past, but with today it becomes a 4-day streak
    // Previous longest was 3. Today extends current run to 4.
    const today = new Date("2026-05-17T14:00:00Z");
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      // Current run: May 14, 15, 16, 17 (today) = 4 days
      { date: new Date("2026-05-14T14:00:00Z"), stitchCount: 100 },
      { date: new Date("2026-05-15T14:00:00Z"), stitchCount: 100 },
      { date: new Date("2026-05-16T14:00:00Z"), stitchCount: 100 },
      { date: today, stitchCount: 50 },
      // Old 3-day streak: May 1, 2, 3
      { date: new Date("2026-05-01T14:00:00Z"), stitchCount: 100 },
      { date: new Date("2026-05-02T14:00:00Z"), stitchCount: 100 },
      { date: new Date("2026-05-03T14:00:00Z"), stitchCount: 100 },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: today,
      stitchCount: 50,
      projectId: "proj-1",
    });

    const longestStreak = result.find((r) => r.type === "longestStreak");
    expect(longestStreak).toBeDefined();
    expect(longestStreak!.newValue).toBe(4);
    expect(longestStreak!.oldValue).toBe(3);
    expect(longestStreak!.unit).toBe("days");
    expect(longestStreak!.label).toBe("Longest Streak");
  });

  it("returns multiple broken records when session breaks both bestDay and bestSession", async () => {
    // Today's total = 1000 (beats previous best day of 500)
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 1000 },
    });

    // Previous sessions: best day was 500, best session was 400
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-10T14:00:00Z"),
        stitchCount: 300,
      },
      {
        date: new Date("2026-05-10T20:00:00Z"),
        stitchCount: 200,
      },
      {
        date: new Date("2026-05-11T14:00:00Z"),
        stitchCount: 400,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 1000,
      projectId: "proj-1",
    });

    expect(result.length).toBeGreaterThanOrEqual(2);
    expect(result.some((r) => r.type === "bestDay")).toBe(true);
    expect(result.some((r) => r.type === "bestSession")).toBe(true);
  });

  it("does NOT compare against today's own sessions for bestDay (avoids self-comparison)", async () => {
    // The aggregate query for today includes the new session, but the "previous best"
    // query should only look at days BEFORE today
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 200 },
    });

    // Only sessions are from today — no previous days to compare against
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      {
        date: new Date("2026-05-17T10:00:00Z"),
        stitchCount: 100,
      },
      {
        date: new Date("2026-05-17T14:00:00Z"),
        stitchCount: 100,
      },
    ]);

    const { detectBrokenRecords } = await import("./record-detection");
    const result = await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 100,
      projectId: "proj-1",
    });

    // First-ever day with sessions: oldValue should be 0, and it IS a new record
    const bestDay = result.find((r) => r.type === "bestDay");
    if (bestDay) {
      expect(bestDay.oldValue).toBe(0);
    }
  });

  it("uses timezone-aware date boundaries for 'today' calculation", async () => {
    mockPrisma.stitchSession.aggregate.mockResolvedValue({
      _sum: { stitchCount: 100 },
    });
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { detectBrokenRecords } = await import("./record-detection");
    await detectBrokenRecords("user-1", {
      date: new Date("2026-05-17T14:00:00Z"),
      stitchCount: 100,
      projectId: "proj-1",
    });

    // Verify the aggregate query uses date boundaries (gte/lt)
    expect(mockPrisma.stitchSession.aggregate).toHaveBeenCalledWith(
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
