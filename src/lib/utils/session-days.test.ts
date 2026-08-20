import { describe, expect, it } from "vitest";
import { summariseSessionDays } from "./session-days";

describe("summariseSessionDays", () => {
  it("returns no entry for a project with no session groups", () => {
    expect(summariseSessionDays([]).get("p1")).toBeUndefined();
  });

  it("counts one day per distinct calendar date", () => {
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-01T00:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-02T00:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-03T00:00:00Z") },
    ]);

    expect(totals.get("p1")!.days).toBe(3);
  });

  it("counts two instants on the same calendar day as one day", () => {
    // Writes go through parseCalendarDate so this should not occur, but StitchSession.date is
    // DateTime with no constraint — the fold must not depend on the convention holding.
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-01T10:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-01T15:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-02T10:00:00Z") },
    ]);

    expect(totals.get("p1")!.days).toBe(2);
  });

  it("reports the latest instant as lastDate whatever order the rows arrive in", () => {
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-02T00:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-05T00:00:00Z") },
      { projectId: "p1", date: new Date("2026-01-03T00:00:00Z") },
    ]);

    expect(totals.get("p1")!.lastDate).toEqual(new Date("2026-01-05T00:00:00Z"));
  });

  it("sums minutes across days and counts a null sum as zero", () => {
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-01T00:00:00Z"), _sum: { timeSpentMinutes: 60 } },
      { projectId: "p1", date: new Date("2026-01-02T00:00:00Z"), _sum: { timeSpentMinutes: null } },
      { projectId: "p1", date: new Date("2026-01-03T00:00:00Z"), _sum: { timeSpentMinutes: 45 } },
    ]);

    expect(totals.get("p1")!.minutes).toBe(105);
  });

  it("treats a missing _sum as zero minutes", () => {
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-01T00:00:00Z") },
    ]);

    expect(totals.get("p1")!.minutes).toBe(0);
  });

  it("keeps projects separate", () => {
    const totals = summariseSessionDays([
      { projectId: "p1", date: new Date("2026-01-01T00:00:00Z"), _sum: { timeSpentMinutes: 30 } },
      { projectId: "p2", date: new Date("2026-01-04T00:00:00Z"), _sum: { timeSpentMinutes: 90 } },
      { projectId: "p2", date: new Date("2026-01-05T00:00:00Z"), _sum: { timeSpentMinutes: 10 } },
    ]);

    expect(totals.get("p1")).toEqual({
      lastDate: new Date("2026-01-01T00:00:00Z"),
      days: 1,
      minutes: 30,
    });
    expect(totals.get("p2")).toEqual({
      lastDate: new Date("2026-01-05T00:00:00Z"),
      days: 2,
      minutes: 100,
    });
  });
});
