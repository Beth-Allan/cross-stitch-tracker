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

describe("getDayOfWeekPattern", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 7 DayOfWeekData entries (Mon through Sun)", async () => {
    mockPrisma.stitchSession.findMany.mockResolvedValue([]);

    const { getDayOfWeekPattern } = await import("./day-of-week");
    const result = await getDayOfWeekPattern("user-1");

    expect(result).toHaveLength(7);
    expect(result[0].dayOfWeek).toBe("Mon");
    expect(result[1].dayOfWeek).toBe("Tue");
    expect(result[2].dayOfWeek).toBe("Wed");
    expect(result[3].dayOfWeek).toBe("Thu");
    expect(result[4].dayOfWeek).toBe("Fri");
    expect(result[5].dayOfWeek).toBe("Sat");
    expect(result[6].dayOfWeek).toBe("Sun");
  });

  it("avgStitches calculated correctly per day of week", async () => {
    // 2026-05-11 = Monday, 2026-05-18 = Monday, 2026-05-12 = Tuesday
    // All at 12:00 UTC = 06:00 MDT (same calendar date in Denver)
    mockPrisma.stitchSession.findMany.mockResolvedValue([
      { date: new Date("2026-05-11T12:00:00.000Z"), stitchCount: 100 }, // Monday
      { date: new Date("2026-05-18T12:00:00.000Z"), stitchCount: 200 }, // Monday
      { date: new Date("2026-05-12T12:00:00.000Z"), stitchCount: 300 }, // Tuesday
    ]);

    const { getDayOfWeekPattern } = await import("./day-of-week");
    const result = await getDayOfWeekPattern("user-1");

    // Monday avg = (100 + 200) / 2 = 150
    const monday = result.find((d) => d.dayOfWeek === "Mon");
    expect(monday).toBeDefined();
    expect(monday!.avgStitches).toBe(150);

    // Tuesday avg = 300 / 1 = 300
    const tuesday = result.find((d) => d.dayOfWeek === "Tue");
    expect(tuesday).toBeDefined();
    expect(tuesday!.avgStitches).toBe(300);

    // Wednesday avg = 0 (no sessions)
    const wednesday = result.find((d) => d.dayOfWeek === "Wed");
    expect(wednesday).toBeDefined();
    expect(wednesday!.avgStitches).toBe(0);
  });
});
