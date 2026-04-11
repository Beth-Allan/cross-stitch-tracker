import { describe, expect, it } from "vitest";
import dmcThreads from "../../../prisma/fixtures/dmc-threads.json";

describe("DMC thread catalog", () => {
  it("contains Blanc entry", () => {
    expect(dmcThreads.find((t) => t.colorCode === "Blanc")).toBeDefined();
  });

  it("contains threads 1-35", () => {
    for (let i = 1; i <= 35; i++) {
      expect(
        dmcThreads.find((t) => t.colorCode === String(i)),
        `Missing DMC ${i}`,
      ).toBeDefined();
    }
  });

  it("each entry has required fields", () => {
    for (const thread of dmcThreads) {
      expect(thread).toHaveProperty("colorCode");
      expect(thread).toHaveProperty("colorName");
      expect(thread).toHaveProperty("hexColor");
      expect(thread).toHaveProperty("colorFamily");
    }
  });

  it("has at least 495 entries", () => {
    expect(dmcThreads.length).toBeGreaterThanOrEqual(495);
  });

  it("no duplicate codes", () => {
    const codes = dmcThreads.map((t) => t.colorCode);
    expect(new Set(codes).size).toBe(codes.length);
  });
});
