import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

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

    // 2026-05-17 16:30 MDT — the local calendar date is 2026-05-17
    const NOW_MDT = new Date("2026-05-17T22:30:00.000Z");

    it("returns todayStart at UTC midnight of the local calendar date", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.todayStart)).toBe("2026-05-17T00:00:00.000Z");
    });

    it("returns todayEnd at the last millisecond of that UTC day", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.todayEnd)).toBe("2026-05-17T23:59:59.999Z");
    });

    it("returns weekStart on the Sunday that starts the local week", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      // 2026-05-17 is a Sunday, so weekStart is that same day
      expect(toUTC(boundaries.weekStart)).toBe("2026-05-17T00:00:00.000Z");
    });

    it("returns monthStart on the 1st of the local current month", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.monthStart)).toBe("2026-05-01T00:00:00.000Z");
    });

    it("returns yearStart on Jan 1 of the local current year", async () => {
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      expect(toUTC(boundaries.yearStart)).toBe("2026-01-01T00:00:00.000Z");
    });

    it("uses the local calendar date, not the UTC one, when they disagree", async () => {
      // 2026-05-18T04:00Z is still 22:00 on 2026-05-17 in Denver
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, new Date("2026-05-18T04:00:00.000Z"));

      expect(toUTC(boundaries.todayStart)).toBe("2026-05-17T00:00:00.000Z");
    });

    it("a session dated today falls inside todayStart..todayEnd", async () => {
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, NOW_MDT);

      // A session logged for 2026-05-17 is stored as that date's UTC midnight
      const session = new Date("2026-05-17T00:00:00.000Z");
      expect(session.getTime() >= boundaries.todayStart.getTime()).toBe(true);
      expect(session.getTime() <= boundaries.todayEnd.getTime()).toBe(true);
    });

    it("the first of the month counts in that month, not the previous one", async () => {
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, new Date("2026-05-17T22:30:00.000Z"));

      const firstOfMonth = new Date("2026-05-01T00:00:00.000Z");
      expect(firstOfMonth.getTime() >= boundaries.monthStart.getTime()).toBe(true);
    });

    it("January 1st counts in that year, not the previous one", async () => {
      vi.resetModules();
      const { getLocalDayBoundaries } = await import("./timezone");
      const boundaries = getLocalDayBoundaries(TIMEZONE, new Date("2026-05-17T22:30:00.000Z"));

      const newYearsDay = new Date("2026-01-01T00:00:00.000Z");
      expect(newYearsDay.getTime() >= boundaries.yearStart.getTime()).toBe(true);
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

  describe("getCurrentPeriod", () => {
    it("reports the month and year of the user's local today", async () => {
      const { getCurrentPeriod } = await import("./timezone");

      // 2026-01-01T04:00Z is still 21:00 on 2025-12-31 in Denver
      expect(getCurrentPeriod("America/Denver", new Date("2026-01-01T04:00:00.000Z"))).toEqual({
        year: 2025,
        month: 12,
      });
    });

    it("returns a 1-based month", async () => {
      const { getCurrentPeriod } = await import("./timezone");

      expect(getCurrentPeriod("UTC", new Date("2026-08-17T12:00:00.000Z"))).toEqual({
        year: 2026,
        month: 8,
      });
    });

    it("throws an error for an invalid timezone string", async () => {
      vi.resetModules();
      const { getCurrentPeriod } = await import("./timezone");

      expect(() => getCurrentPeriod("Invalid/Timezone")).toThrow(
        'Invalid timezone "Invalid/Timezone"',
      );
    });
  });
});
