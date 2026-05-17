import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to mock env before importing the module
const originalEnv = process.env;

/**
 * Convert a TZDate to a plain UTC ISO string for assertions.
 * TZDate.toISOString() includes timezone offset; this normalizes to UTC.
 */
function toUTC(date: Date): string {
  return new Date(date.getTime()).toISOString();
}

describe("timezone utilities", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    vi.useRealTimers();
    process.env = originalEnv;
  });

  describe("getUserTimezone", () => {
    it("returns process.env.STATS_TIMEZONE when set", async () => {
      process.env.STATS_TIMEZONE = "America/Denver";
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("America/Denver");
    });

    it("returns America/Denver as default when STATS_TIMEZONE is not set", async () => {
      delete process.env.STATS_TIMEZONE;
      vi.resetModules();
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("America/Denver");
    });

    it("returns a custom timezone when STATS_TIMEZONE is set differently", async () => {
      process.env.STATS_TIMEZONE = "Europe/London";
      vi.resetModules();
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("Europe/London");
    });
  });

  describe("getLocalDayBoundaries", () => {
    // Fixed time: 2026-05-17T22:30:00.000Z which is 2026-05-17 16:30 MDT (UTC-6)
    const FIXED_UTC_TIME = new Date("2026-05-17T22:30:00.000Z").getTime();
    const TIMEZONE = "America/Denver";

    it("returns todayStart at midnight local time (06:00 UTC for MDT)", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // Midnight MDT = 06:00 UTC on same day
      expect(toUTC(boundaries.todayStart)).toBe("2026-05-17T06:00:00.000Z");
    });

    it("returns todayEnd at 23:59:59.999 local time", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // 23:59:59.999 MDT = 05:59:59.999 UTC next day
      expect(toUTC(boundaries.todayEnd)).toBe("2026-05-18T05:59:59.999Z");
    });

    it("returns weekStart on Sunday midnight local time", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // 2026-05-17 is a Sunday, so weekStart is same day midnight
      // Sunday midnight MDT = 2026-05-17T06:00:00.000Z
      expect(toUTC(boundaries.weekStart)).toBe("2026-05-17T06:00:00.000Z");
    });

    it("returns monthStart on 1st of current month midnight local time", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // May 1 midnight MDT = 2026-05-01T06:00:00.000Z
      expect(toUTC(boundaries.monthStart)).toBe("2026-05-01T06:00:00.000Z");
    });

    it("returns yearStart on Jan 1 midnight local time (MST in January)", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // Jan 1 midnight MST (UTC-7 in winter) = 2026-01-01T07:00:00.000Z
      expect(toUTC(boundaries.yearStart)).toBe("2026-01-01T07:00:00.000Z");
    });

    it("a session at 11:30pm Mountain Time falls within todayStart..todayEnd", async () => {
      // 2026-05-17T05:30:00.000Z = 2026-05-16 23:30 MDT (still May 16 locally!)
      const LATE_NIGHT_UTC = new Date("2026-05-17T05:30:00.000Z").getTime();
      vi.setSystemTime(LATE_NIGHT_UTC);
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      // "Now" in MDT is 23:30 on May 16, so todayStart is May 16 midnight MDT
      expect(toUTC(boundaries.todayStart)).toBe("2026-05-16T06:00:00.000Z");
      expect(toUTC(boundaries.todayEnd)).toBe("2026-05-17T05:59:59.999Z");

      // The session at 05:30 UTC (23:30 MDT on May 16) falls within boundaries
      const sessionTime = new Date("2026-05-17T05:30:00.000Z");
      expect(sessionTime.getTime() >= boundaries.todayStart.getTime()).toBe(
        true,
      );
      expect(sessionTime.getTime() <= boundaries.todayEnd.getTime()).toBe(true);
    });

    it("all returned dates are valid Date objects (not NaN)", async () => {
      vi.setSystemTime(FIXED_UTC_TIME);
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE);

      expect(boundaries.todayStart.getTime()).not.toBeNaN();
      expect(boundaries.todayEnd.getTime()).not.toBeNaN();
      expect(boundaries.weekStart.getTime()).not.toBeNaN();
      expect(boundaries.monthStart.getTime()).not.toBeNaN();
      expect(boundaries.yearStart.getTime()).not.toBeNaN();
    });
  });
});
