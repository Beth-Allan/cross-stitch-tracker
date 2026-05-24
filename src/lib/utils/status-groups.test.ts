import { describe, it, expect } from "vitest";
import { resolveStatusFilter, STATUS_GROUPS } from "./status-groups";
import type { StatusGroup } from "./status-groups";

describe("resolveStatusFilter", () => {
  it("returns empty array for empty input", () => {
    expect(resolveStatusFilter([])).toEqual([]);
  });

  it('maps "not-started" to ["UNSTARTED"]', () => {
    expect(resolveStatusFilter(["not-started"])).toEqual(["UNSTARTED"]);
  });

  it('maps "in-progress" to ["KITTING", "KITTED", "IN_PROGRESS", "ON_HOLD"]', () => {
    expect(resolveStatusFilter(["in-progress"])).toEqual([
      "KITTING",
      "KITTED",
      "IN_PROGRESS",
      "ON_HOLD",
    ]);
  });

  it('maps "complete" to ["FINISHED", "FFO"]', () => {
    expect(resolveStatusFilter(["complete"])).toEqual(["FINISHED", "FFO"]);
  });

  it("combines multiple groups", () => {
    expect(resolveStatusFilter(["not-started", "complete"])).toEqual([
      "UNSTARTED",
      "FINISHED",
      "FFO",
    ]);
  });

  it("ignores unknown group names", () => {
    expect(resolveStatusFilter(["invalid"])).toEqual([]);
  });

  it("ignores unknown groups while keeping valid ones", () => {
    expect(resolveStatusFilter(["invalid", "not-started", "bogus"])).toEqual(["UNSTARTED"]);
  });
});

describe("STATUS_GROUPS", () => {
  it('contains exactly ["not-started", "in-progress", "complete"]', () => {
    expect(STATUS_GROUPS).toEqual(["not-started", "in-progress", "complete"]);
  });
});

describe("StatusGroup type", () => {
  it("is assignable from valid string literals", () => {
    const a: StatusGroup = "not-started";
    const b: StatusGroup = "in-progress";
    const c: StatusGroup = "complete";
    expect([a, b, c]).toHaveLength(3);
  });
});
