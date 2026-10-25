import { describe, expect, it } from "vitest";
import type { z } from "zod";
import {
  beadSchema,
  projectBeadSchema,
  projectSpecialtySchema,
  projectThreadSchema,
  specialtyItemSchema,
  supplyBrandSchema,
  threadSchema,
} from "./supply";

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

describe("wording a screen shows, unchanged from Zod 3", () => {
  const thread = {
    brandId: "brand-1",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    colorFamily: "BLACK",
  };
  const bead = {
    brandId: "brand-1",
    productCode: "02010",
    colorName: "Ice",
    hexColor: "#FFFFFF",
    colorFamily: "WHITE",
  };
  const specialty = {
    brandId: "brand-1",
    productCode: "KR-001",
    colorName: "Gold braid",
    hexColor: "#D4AF37",
  };
  const tooLong = (max: number) => `String must contain at most ${max} character(s)`;
  const notWhole = "Expected integer, received float";

  it.each<[string, z.ZodType, unknown, string]>([
    ["a thread's color code", threadSchema, { ...thread, colorCode: "x".repeat(51) }, tooLong(50)],
    [
      "a thread's color name",
      threadSchema,
      { ...thread, colorName: "x".repeat(201) },
      tooLong(200),
    ],
    ["a bead's product code", beadSchema, { ...bead, productCode: "x".repeat(51) }, tooLong(50)],
    ["a bead's color name", beadSchema, { ...bead, colorName: "x".repeat(201) }, tooLong(200)],
    [
      "a specialty item's product code",
      specialtyItemSchema,
      { ...specialty, productCode: "x".repeat(51) },
      tooLong(50),
    ],
    [
      "a specialty item's name",
      specialtyItemSchema,
      { ...specialty, colorName: "x".repeat(201) },
      tooLong(200),
    ],
    [
      "a specialty item's description",
      specialtyItemSchema,
      { ...specialty, description: "x".repeat(2001) },
      tooLong(2000),
    ],
    [
      "a fractional stitch count on a project thread",
      projectThreadSchema,
      { projectId: "p1", threadId: "t1", stitchCount: 12.5 },
      notWhole,
    ],
    [
      "a fractional need on a project thread",
      projectThreadSchema,
      { projectId: "p1", threadId: "t1", quantityRequired: 2.5 },
      notWhole,
    ],
    [
      "a fractional need on a project bead",
      projectBeadSchema,
      { projectId: "p1", beadId: "b1", quantityRequired: 2.5 },
      notWhole,
    ],
    [
      "a fractional need on a project specialty item",
      projectSpecialtySchema,
      { projectId: "p1", specialtyItemId: "s1", quantityRequired: 2.5 },
      notWhole,
    ],
  ])("%s", (_label, schema, payload, message) => {
    expect(schema.safeParse(payload).error?.issues[0].message).toBe(message);
  });
});
