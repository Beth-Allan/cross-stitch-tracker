import { describe, expect, it } from "vitest";
import { fabricBrandSchema, fabricSchema } from "./fabric";

describe("fabricBrandSchema", () => {
  it("stores a blank website as absent rather than failing the URL rule", () => {
    expect(fabricBrandSchema.parse({ name: "Zweigart", website: "   " }).website).toBeNull();
  });

  it("still rejects a website that is not a link", () => {
    expect(() => fabricBrandSchema.parse({ name: "Zweigart", website: "nope" })).toThrow(
      "Must be a valid URL",
    );
  });
});

describe("fabricSchema", () => {
  const validFabric = {
    name: "28ct Cashel",
    brandId: "brand-1",
    count: 28,
    type: "Linen",
    colorFamily: "Cream",
    colorType: "Cream",
  };

  it("reads a cleared project link as no link", () => {
    expect(fabricSchema.parse({ ...validFabric, linkedProjectId: "" }).linkedProjectId).toBeNull();
  });
});
