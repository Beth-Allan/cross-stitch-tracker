import { describe, it, expect } from "vitest";
import { navigationSections, navigationItems } from "./nav-items";

describe("navigationSections", () => {
  describe("PDIV-01: Pattern Dive nav label", () => {
    it("contains 'Pattern Dive' label for /charts href", () => {
      const allItems = navigationSections.flatMap((s) => s.items);
      const chartsItem = allItems.find((item) => item.href === "/charts");

      expect(chartsItem).toBeDefined();
      expect(chartsItem?.label).toBe("Pattern Dive");
    });

    it("does not contain the old 'Projects' label for /charts", () => {
      const allItems = navigationSections.flatMap((s) => s.items);
      const chartsItem = allItems.find((item) => item.href === "/charts");

      expect(chartsItem?.label).not.toBe("Projects");
    });

    it("href for the Pattern Dive nav item is /charts", () => {
      const allItems = navigationSections.flatMap((s) => s.items);
      const patternDiveItem = allItems.find((item) => item.label === "Pattern Dive");

      expect(patternDiveItem).toBeDefined();
      expect(patternDiveItem?.href).toBe("/charts");
    });
  });

  describe("flat navigationItems list", () => {
    it("includes Pattern Dive item in flat list", () => {
      const patternDiveItem = navigationItems.find((item) => item.label === "Pattern Dive");
      expect(patternDiveItem).toBeDefined();
      expect(patternDiveItem?.href).toBe("/charts");
    });
  });
});
