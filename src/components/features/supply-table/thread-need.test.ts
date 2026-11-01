import { describe, it, expect } from "vitest";
import { calculateSkeins } from "@/lib/utils/skein-calculator";
import { calculatedNeedFor, projectCalcParams } from "./thread-need";
import { DEFAULT_CALC_PARAMS } from "./types";
import type { CalcParams, SupplyRow } from "./types";
import type { SkeinLine } from "@/types/supply";

const DMC_LINE: SkeinLine = {
  skeinLengthMm: 8000,
  strandStructure: "SIX_STRAND",
  cutLengthInches: 24,
};
const UNKNOWN_LINE: SkeinLine = {
  skeinLengthMm: null,
  strandStructure: null,
  cutLengthInches: null,
};

function makeRow(overrides: Partial<SupplyRow> = {}): SupplyRow {
  return {
    id: "junction-1",
    supplyId: "supply-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    hexColor: "#000000",
    stitchCount: 33678,
    need: 30,
    have: 0,
    isNeedOverridden: true,
    line: DMC_LINE,
    ...overrides,
  };
}

describe("calculatedNeedFor", () => {
  it("gives a marked thread the calculator's figure, not the one typed over it", () => {
    const figure = calculateSkeins({
      stitchCount: 33678,
      ...DEFAULT_CALC_PARAMS,
      line: DMC_LINE,
    });

    expect(figure).not.toBe(30);
    expect(calculatedNeedFor(makeRow(), DEFAULT_CALC_PARAMS)).toBe(figure);
  });

  it("works it out from the settings it is given", () => {
    const settings: CalcParams = {
      fabricCount: 18,
      strandCount: 3,
      overCount: 2,
      wastePercent: 10,
    };

    expect(calculatedNeedFor(makeRow(), settings)).toBe(
      calculateSkeins({ stitchCount: 33678, ...settings, line: DMC_LINE }),
    );
  });

  it("still gives a figure when it equals the one typed, so the mark can clear", () => {
    const figure = calculatedNeedFor(makeRow(), DEFAULT_CALC_PARAMS);

    expect(calculatedNeedFor(makeRow({ need: figure }), DEFAULT_CALC_PARAMS)).toBe(figure);
  });

  it("gives nothing to a need that is not marked as typed", () => {
    expect(calculatedNeedFor(makeRow({ isNeedOverridden: false }), DEFAULT_CALC_PARAMS)).toBeNull();
  });

  it("gives nothing without a stitch count, never the 1 a line starts at", () => {
    expect(calculatedNeedFor(makeRow({ stitchCount: 0 }), DEFAULT_CALC_PARAMS)).toBeNull();
  });

  it("gives nothing on a line of unknown length, so a typed figure is never lost to Unknown", () => {
    expect(calculatedNeedFor(makeRow({ line: UNKNOWN_LINE }), DEFAULT_CALC_PARAMS)).toBeNull();
    expect(calculatedNeedFor(makeRow({ line: null }), DEFAULT_CALC_PARAMS)).toBeNull();
  });

  it("gives nothing to a bead or specialty line, which the calculator does not cover", () => {
    expect(calculatedNeedFor(makeRow({ type: "BEAD" }), DEFAULT_CALC_PARAMS)).toBeNull();
    expect(calculatedNeedFor(makeRow({ type: "SPECIALTY" }), DEFAULT_CALC_PARAMS)).toBeNull();
  });
});

describe("projectCalcParams", () => {
  const SAVED = { strandCount: 3, overCount: 2, wastePercent: 25 };

  it("reads the linked fabric's count and the project's own settings", () => {
    expect(projectCalcParams({ ...SAVED, fabricCount: 28 })).toEqual({
      fabricCount: 28,
      strandCount: 3,
      overCount: 2,
      wastePercent: 25,
    });
  });

  it("falls back to the default count when no fabric is linked", () => {
    expect(projectCalcParams({ ...SAVED, fabricCount: undefined }).fabricCount).toBe(
      DEFAULT_CALC_PARAMS.fabricCount,
    );
  });

  it("falls back to the default strands for a stored count the calculator cannot use", () => {
    expect(
      projectCalcParams({ ...SAVED, strandCount: 9, fabricCount: undefined }).strandCount,
    ).toBe(DEFAULT_CALC_PARAMS.strandCount);
  });
});
