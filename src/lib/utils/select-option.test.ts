import { describe, expect, it } from "vitest";
import { optionFrom } from "./select-option";

const OPTIONS = ["THREAD", "BEAD", "SPECIALTY"] as const;

describe("optionFrom", () => {
  it("returns the matching option", () => {
    expect(optionFrom(OPTIONS, "BEAD")).toBe("BEAD");
  });

  it("returns undefined for a value that is not an option", () => {
    expect(optionFrom(OPTIONS, "GLITTER")).toBeUndefined();
  });

  it("does not match on a different case", () => {
    expect(optionFrom(OPTIONS, "bead")).toBeUndefined();
  });

  it("returns undefined for an empty value", () => {
    expect(optionFrom(OPTIONS, "")).toBeUndefined();
  });
});
