import { describe, expect, it } from "vitest";
import { naturalSortByCode } from "./natural-sort";

describe("naturalSortByCode", () => {
  it("sorts numeric codes by numeric value (310 before 3761)", () => {
    expect(naturalSortByCode("310", "3761")).toBeLessThan(0);
  });

  it("sorts numeric codes by numeric value (500 before 3761)", () => {
    expect(naturalSortByCode("3761", "500")).toBeGreaterThan(0);
  });

  it("returns 0 for equal codes", () => {
    expect(naturalSortByCode("334", "334")).toBe(0);
  });

  it("places text codes after numeric codes (Blanc after 310)", () => {
    expect(naturalSortByCode("Blanc", "310")).toBeGreaterThan(0);
  });

  it("places numeric codes before text codes (310 before Blanc)", () => {
    expect(naturalSortByCode("310", "Blanc")).toBeLessThan(0);
  });

  it("sorts text codes alphabetically (Blanc before Ecru)", () => {
    expect(naturalSortByCode("Blanc", "Ecru")).toBeLessThan(0);
  });

  it("sorts text codes alphabetically (Ecru after Blanc)", () => {
    expect(naturalSortByCode("Ecru", "Blanc")).toBeGreaterThan(0);
  });

  it("sorts a full array of mixed codes in natural order", () => {
    const codes = ["334", "3761", "500", "150", "Blanc", "Ecru"];
    const sorted = codes.sort(naturalSortByCode);
    expect(sorted).toEqual(["150", "334", "500", "3761", "Blanc", "Ecru"]);
  });

  it("returns 0 for equal text codes", () => {
    expect(naturalSortByCode("Blanc", "Blanc")).toBe(0);
  });
});
