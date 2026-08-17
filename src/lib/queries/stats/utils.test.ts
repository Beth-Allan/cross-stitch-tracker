import { describe, it, expect } from "vitest";
import { buildDateFilter, monthBounds } from "./utils";

describe("buildDateFilter", () => {
  it("returns null for the all-time scope", () => {
    expect(buildDateFilter("all")).toBeNull();
  });

  it("returns null for a scope that is not a year", () => {
    expect(buildDateFilter("nonsense")).toBeNull();
  });

  it("returns null for a year outside the four-digit range", () => {
    expect(buildDateFilter("26")).toBeNull();
    expect(buildDateFilter("99999")).toBeNull();
  });

  it("bounds a year by the UTC-midnight instants that store Jan 1", () => {
    const filter = buildDateFilter("2026");

    expect(filter).not.toBeNull();
    expect(filter!.gte.toISOString()).toBe("2026-01-01T00:00:00.000Z");
    expect(filter!.lt.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("includes a session dated January 1st in that year", () => {
    const filter = buildDateFilter("2026")!;
    const newYearsDay = new Date("2026-01-01T00:00:00.000Z");

    expect(newYearsDay >= filter.gte).toBe(true);
    expect(newYearsDay < filter.lt).toBe(true);
  });

  it("excludes a session dated December 31st of the previous year", () => {
    const filter = buildDateFilter("2026")!;
    const newYearsEve = new Date("2025-12-31T00:00:00.000Z");

    expect(newYearsEve >= filter.gte).toBe(false);
  });
});

describe("monthBounds", () => {
  it("bounds a month by the UTC-midnight instants that store its 1st", () => {
    const { monthStart, nextMonthStart } = monthBounds(2026, 5);

    expect(monthStart.toISOString()).toBe("2026-05-01T00:00:00.000Z");
    expect(nextMonthStart.toISOString()).toBe("2026-06-01T00:00:00.000Z");
  });

  it("pads single-digit months", () => {
    const { monthStart, nextMonthStart } = monthBounds(2026, 9);

    expect(monthStart.toISOString()).toBe("2026-09-01T00:00:00.000Z");
    expect(nextMonthStart.toISOString()).toBe("2026-10-01T00:00:00.000Z");
  });

  it("rolls December over into the next year", () => {
    const { monthStart, nextMonthStart } = monthBounds(2026, 12);

    expect(monthStart.toISOString()).toBe("2026-12-01T00:00:00.000Z");
    expect(nextMonthStart.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("includes a session dated the 1st and excludes the last day of the previous month", () => {
    const { monthStart } = monthBounds(2026, 5);

    expect(new Date("2026-05-01T00:00:00.000Z") >= monthStart).toBe(true);
    expect(new Date("2026-04-30T00:00:00.000Z") >= monthStart).toBe(false);
  });
});
