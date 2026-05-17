import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TZDate } from "@date-fns/tz";

const originalEnv = process.env;

function toUTC(date: Date): string {
  return new Date(date.getTime()).toISOString();
}

describe("timezone utilities", () => {
  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("getUserTimezone", () => {
    it("returns process.env.STATS_TIMEZONE when set", async () => {
      process.env.STATS_TIMEZONE = "America/Denver";
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("America/Denver");
    });

    it("returns America/Edmonton as default when STATS_TIMEZONE is not set", async () => {
      delete process.env.STATS_TIMEZONE;
      vi.resetModules();
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("America/Edmonton");
    });

    it("returns a custom timezone when STATS_TIMEZONE is set differently", async () => {
      process.env.STATS_TIMEZONE = "Europe/London";
      vi.resetModules();
      const { getUserTimezone } = await import("./timezone");
      expect(getUserTimezone("user-1")).toBe("Europe/London");
    });
  });

  describe("getLocalDayBoundaries", () => {
    const TIMEZONE = "America/Denver";

    // 2026-05-17 16:30 MDT = 2026-05-17T22:30:00.000Z
    // Construct an explicit TZDate so tests don't depend on host timezone or fake timers
    const NOW_MDT = new TZDate(2026, 4, 17, 16, 30, 0, 0, TIMEZONE);

    it("returns todayStart at midnight local time (06:00 UTC for MDT)", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.todayStart)).toBe("2026-05-17T06:00:00.000Z");
    });

    it("returns todayEnd at 23:59:59.999 local time", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.todayEnd)).toBe("2026-05-18T05:59:59.999Z");
    });

    it("returns weekStart on Sunday midnight local time", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      // 2026-05-17 is a Sunday, so weekStart is same day midnight
      expect(toUTC(boundaries.weekStart)).toBe("2026-05-17T06:00:00.000Z");
    });

    it("returns monthStart on 1st of current month midnight local time", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.monthStart)).toBe("2026-05-01T06:00:00.000Z");
    });

    it("returns yearStart on Jan 1 midnight local time (MST in January)", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      // Jan 1 midnight MST (UTC-7 in winter)
      expect(toUTC(boundaries.yearStart)).toBe("2026-01-01T07:00:00.000Z");
    });

    it("a session at 11:30pm Mountain Time falls within todayStart..todayEnd", async () => {
      // 2026-05-16 23:30 MDT = 2026-05-17T05:30:00.000Z
      const lateNight = new TZDate(2026, 4, 16, 23, 30, 0, 0, TIMEZONE);

      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, lateNight);

      // todayStart is May 16 midnight MDT
      expect(toUTC(boundaries.todayStart)).toBe("2026-05-16T06:00:00.000Z");
      expect(toUTC(boundaries.todayEnd)).toBe("2026-05-17T05:59:59.999Z");

      // The session at 05:30 UTC (23:30 MDT on May 16) falls within boundaries
      const sessionTime = new Date("2026-05-17T05:30:00.000Z");
      expect(sessionTime.getTime() >= boundaries.todayStart.getTime()).toBe(true);
      expect(sessionTime.getTime() <= boundaries.todayEnd.getTime()).toBe(true);
    });

    it("all returned dates are valid Date objects (not NaN)", async () => {
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(boundaries.todayStart.getTime()).not.toBeNaN();
      expect(boundaries.todayEnd.getTime()).not.toBeNaN();
      expect(boundaries.weekStart.getTime()).not.toBeNaN();
      expect(boundaries.monthStart.getTime()).not.toBeNaN();
      expect(boundaries.yearStart.getTime()).not.toBeNaN();
    });

    it("throws an error for an invalid timezone string", async () => {
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");

      expect(() => getLocalDayBoundaries("Invalid/Timezone")).toThrow(
        'Invalid timezone "Invalid/Timezone"',
      );
    });
  });
});
