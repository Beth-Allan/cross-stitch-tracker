import { describe, it, expect } from "vitest";
import { computeSeriesProgress, FINISHED_STATUSES } from "./series-progress";

describe("computeSeriesProgress", () => {
  it("returns all zeros for empty charts array with null totalCount", () => {
    expect(computeSeriesProgress([], null)).toEqual({
      ownedCount: 0,
      finishedCount: 0,
      totalCount: null,
    });
  });

  it("returns all zeros for empty charts array with totalCount set", () => {
    expect(computeSeriesProgress([], 10)).toEqual({
      ownedCount: 0,
      finishedCount: 0,
      totalCount: 10,
    });
  });

  it("counts FINISHED and FFO as finished", () => {
    const charts = [
      { project: { status: "FINISHED" } },
      { project: { status: "FFO" } },
      { project: { status: "IN_PROGRESS" } },
    ];
    expect(computeSeriesProgress(charts, null)).toEqual({
      ownedCount: 3,
      finishedCount: 2,
      totalCount: null,
    });
  });

  it("passes through totalCount when set", () => {
    const charts = [
      { project: { status: "FINISHED" } },
      { project: { status: "FFO" } },
      { project: { status: "IN_PROGRESS" } },
    ];
    expect(computeSeriesProgress(charts, 5)).toEqual({
      ownedCount: 3,
      finishedCount: 2,
      totalCount: 5,
    });
  });

  it("counts charts with null project as owned but not finished", () => {
    const charts = [{ project: null }, { project: null }];
    expect(computeSeriesProgress(charts, null)).toEqual({
      ownedCount: 2,
      finishedCount: 0,
      totalCount: null,
    });
  });

  it("does not count UNSTARTED as finished", () => {
    const charts = [{ project: { status: "UNSTARTED" } }];
    expect(computeSeriesProgress(charts, null)).toEqual({
      ownedCount: 1,
      finishedCount: 0,
      totalCount: null,
    });
  });

  it("counts multiple FINISHED statuses correctly", () => {
    const charts = [
      { project: { status: "FINISHED" } },
      { project: { status: "FFO" } },
      { project: { status: "FINISHED" } },
      { project: { status: "KITTING" } },
    ];
    expect(computeSeriesProgress(charts, 12)).toEqual({
      ownedCount: 4,
      finishedCount: 3,
      totalCount: 12,
    });
  });
});

describe("FINISHED_STATUSES", () => {
  it('contains exactly "FINISHED" and "FFO"', () => {
    expect(FINISHED_STATUSES.has("FINISHED")).toBe(true);
    expect(FINISHED_STATUSES.has("FFO")).toBe(true);
    expect(FINISHED_STATUSES.size).toBe(2);
  });

  it("does not contain other statuses", () => {
    expect(FINISHED_STATUSES.has("UNSTARTED")).toBe(false);
    expect(FINISHED_STATUSES.has("KITTING")).toBe(false);
    expect(FINISHED_STATUSES.has("KITTED")).toBe(false);
    expect(FINISHED_STATUSES.has("IN_PROGRESS")).toBe(false);
    expect(FINISHED_STATUSES.has("ON_HOLD")).toBe(false);
  });
});
