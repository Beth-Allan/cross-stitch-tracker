import { describe, expect, it } from "vitest";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";

describe("DEFAULT_SUPPLY_HEX", () => {
  it("equals the expected hex value", () => {
    expect(DEFAULT_SUPPLY_HEX).toBe("#79796e");
  });

  it("is a valid 7-character hex color string", () => {
    expect(DEFAULT_SUPPLY_HEX).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it("is a non-null string", () => {
    expect(typeof DEFAULT_SUPPLY_HEX).toBe("string");
    expect(DEFAULT_SUPPLY_HEX).not.toBeNull();
    expect(DEFAULT_SUPPLY_HEX).not.toBeUndefined();
  });
});
