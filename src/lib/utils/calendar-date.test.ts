import { describe, it, expect } from "vitest";
import {
  parseCalendarDate,
  toCalendarDate,
  currentCalendarDate,
  addCalendarDays,
  daysBetweenCalendarDates,
  startOfCalendarWeek,
  startOfCalendarMonth,
  startOfCalendarYear,
  formatCalendarDate,
} from "./calendar-date";

describe("parseCalendarDate", () => {
  it("stores a calendar date as the UTC-midnight instant of that date", () => {
    expect(parseCalendarDate("2026-08-17").toISOString()).toBe("2026-08-17T00:00:00.000Z");
  });

  it("is unaffected by daylight-saving transitions", () => {
    expect(parseCalendarDate("2026-03-08").toISOString()).toBe("2026-03-08T00:00:00.000Z");
    expect(parseCalendarDate("2026-11-01").toISOString()).toBe("2026-11-01T00:00:00.000Z");
  });

  it("rejects a value that is not a bare calendar date", () => {
    expect(() => parseCalendarDate("2026-08-17T12:00:00Z")).toThrow(/calendar date/);
    expect(() => parseCalendarDate("17/08/2026")).toThrow(/calendar date/);
    expect(() => parseCalendarDate("")).toThrow(/calendar date/);
  });

  it("rejects a well-shaped but impossible date", () => {
    expect(() => parseCalendarDate("2026-02-31")).toThrow(/calendar date/);
    expect(() => parseCalendarDate("2026-13-01")).toThrow(/calendar date/);
  });
});

describe("toCalendarDate", () => {
  it("reads the date parts of a stored instant in UTC", () => {
    expect(toCalendarDate(new Date("2026-08-17T00:00:00.000Z"))).toBe("2026-08-17");
  });

  it("round-trips with parseCalendarDate", () => {
    expect(toCalendarDate(parseCalendarDate("2026-01-01"))).toBe("2026-01-01");
    expect(toCalendarDate(parseCalendarDate("2026-12-31"))).toBe("2026-12-31");
  });
});

describe("currentCalendarDate", () => {
  it("resolves the instant into the calendar date of the given timezone", () => {
    // 2026-08-18T04:00Z is still 2026-08-17 (22:00) in Edmonton
    const instant = new Date("2026-08-18T04:00:00.000Z");
    expect(currentCalendarDate("America/Edmonton", instant)).toBe("2026-08-17");
    expect(currentCalendarDate("UTC", instant)).toBe("2026-08-18");
  });

  it("handles a timezone ahead of UTC", () => {
    const instant = new Date("2026-08-17T20:00:00.000Z");
    expect(currentCalendarDate("Pacific/Auckland", instant)).toBe("2026-08-18");
  });

  it("pads month and day to two digits", () => {
    expect(currentCalendarDate("UTC", new Date("2026-01-05T12:00:00.000Z"))).toBe("2026-01-05");
  });
});

describe("addCalendarDays", () => {
  it("adds and subtracts whole calendar days", () => {
    expect(addCalendarDays("2026-08-17", 1)).toBe("2026-08-18");
    expect(addCalendarDays("2026-08-17", -1)).toBe("2026-08-16");
  });

  it("crosses month and year boundaries", () => {
    expect(addCalendarDays("2026-08-31", 1)).toBe("2026-09-01");
    expect(addCalendarDays("2026-01-01", -1)).toBe("2025-12-31");
  });

  it("crosses a daylight-saving transition without losing a day", () => {
    expect(addCalendarDays("2026-03-07", 1)).toBe("2026-03-08");
    expect(addCalendarDays("2026-03-08", 1)).toBe("2026-03-09");
    expect(addCalendarDays("2026-10-31", 1)).toBe("2026-11-01");
    expect(addCalendarDays("2026-11-01", 1)).toBe("2026-11-02");
  });
});

describe("daysBetweenCalendarDates", () => {
  it("counts whole calendar days between two dates", () => {
    expect(daysBetweenCalendarDates("2026-08-17", "2026-08-16")).toBe(1);
    expect(daysBetweenCalendarDates("2026-08-17", "2026-08-17")).toBe(0);
    expect(daysBetweenCalendarDates("2026-08-16", "2026-08-17")).toBe(-1);
  });

  it("counts across a daylight-saving transition exactly", () => {
    expect(daysBetweenCalendarDates("2026-03-09", "2026-03-07")).toBe(2);
    expect(daysBetweenCalendarDates("2026-11-02", "2026-10-31")).toBe(2);
  });
});

describe("startOfCalendarWeek", () => {
  it("returns the Sunday that starts the week", () => {
    // 2026-08-17 is a Monday; the week starts Sunday 2026-08-16
    expect(startOfCalendarWeek("2026-08-17")).toBe("2026-08-16");
  });

  it("returns the date itself when it is a Sunday", () => {
    expect(startOfCalendarWeek("2026-08-16")).toBe("2026-08-16");
  });

  it("crosses a month boundary backwards", () => {
    // 2026-08-01 is a Saturday; the week starts Sunday 2026-07-26
    expect(startOfCalendarWeek("2026-08-01")).toBe("2026-07-26");
  });
});

describe("startOfCalendarMonth / startOfCalendarYear", () => {
  it("returns the first day of the month", () => {
    expect(startOfCalendarMonth("2026-08-17")).toBe("2026-08-01");
    expect(startOfCalendarMonth("2026-01-31")).toBe("2026-01-01");
  });

  it("returns January 1st of the year", () => {
    expect(startOfCalendarYear("2026-08-17")).toBe("2026-01-01");
  });

  it("rejects a value that is not a calendar date", () => {
    expect(() => startOfCalendarMonth("nonsense")).toThrow(/calendar date/);
    expect(() => startOfCalendarYear("nonsense")).toThrow(/calendar date/);
  });
});

describe("formatCalendarDate", () => {
  it("formats the stored date, never the viewer's local shift of it", () => {
    expect(formatCalendarDate(new Date("2026-08-17T00:00:00.000Z"))).toBe("Aug 17, 2026");
  });

  it("accepts a calendar-date string", () => {
    expect(formatCalendarDate("2026-08-17")).toBe("Aug 17, 2026");
  });

  it("accepts explicit Intl options and locale", () => {
    expect(formatCalendarDate("2026-08-17", { month: "short", year: "numeric" })).toBe("Aug 2026");
    expect(
      formatCalendarDate(
        "2026-08-17",
        { year: "numeric", month: "short", day: "numeric" },
        "en-CA",
      ),
    ).toBe("Aug 17, 2026");
  });

  it("formats January 1st as January 1st", () => {
    expect(formatCalendarDate("2026-01-01")).toBe("Jan 1, 2026");
  });
});
