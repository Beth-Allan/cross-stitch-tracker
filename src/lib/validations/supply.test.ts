import { describe, expect, it } from "vitest";
import { specialtyItemSchema, supplyBrandSchema } from "./supply";

describe("supplyBrandSchema", () => {
  it("stores a blank website as absent rather than failing the URL rule", () => {
    expect(
      supplyBrandSchema.parse({ name: "DMC", website: "   ", supplyType: "THREAD" }).website,
    ).toBeNull();
  });

  it("still rejects a website that is not a link", () => {
    expect(() =>
      supplyBrandSchema.parse({ name: "DMC", website: "nope", supplyType: "THREAD" }),
    ).toThrow("Must be a valid URL");
  });
});

describe("specialtyItemSchema", () => {
  it("keeps an empty description as an empty string, because the column is not nullable", () => {
    const result = specialtyItemSchema.parse({
      brandId: "brand-1",
      productCode: "KR-001",
      colorName: "Gold braid",
      hexColor: "#D4AF37",
    });

    expect(result.description).toBe("");
  });
});
