import { describe, it, expect, beforeEach } from "vitest";
import { LocalStateAdapter } from "./local-state-adapter";
import type { SupplySearchResult } from "./types";
import { createMockSupplyBrand, createMockThread, createMockBead, createMockSpecialtyItem } from "@/__tests__/mocks/factories";

function makeSearchResult(overrides: Partial<SupplySearchResult>): SupplySearchResult {
  return {
    id: "sr-1",
    type: "THREAD",
    code: "310",
    name: "Black",
    brandName: "DMC",
    brandId: "brand-1",
    hexColor: "#000000",
    ...overrides,
  };
}

describe("LocalStateAdapter", () => {
  let threads: SupplySearchResult[];
  let beads: SupplySearchResult[];
  let specialty: SupplySearchResult[];
  let adapter: LocalStateAdapter;

  beforeEach(() => {
    threads = [
      makeSearchResult({ id: "t1", type: "THREAD", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", type: "THREAD", code: "3100", name: "Dark Antique Mauve" }),
      makeSearchResult({ id: "t3", type: "THREAD", code: "666", name: "Bright Red" }),
      makeSearchResult({ id: "t4", type: "THREAD", code: "Blanc", name: "White" }),
    ];
    beads = [
      makeSearchResult({ id: "b1", type: "BEAD", code: "00123", name: "Red", brandName: "Mill Hill", brandId: "brand-2" }),
      makeSearchResult({ id: "b2", type: "BEAD", code: "00456", name: "Blue", brandName: "Mill Hill", brandId: "brand-2" }),
    ];
    specialty = [
      makeSearchResult({ id: "s1", type: "SPECIALTY", code: "K001", name: "Gold Braid", brandName: "Kreinik", brandId: "brand-3" }),
    ];
    adapter = new LocalStateAdapter(threads, beads, specialty);
  });

  describe("constructor", () => {
    it("accepts initial data arrays", () => {
      const a = new LocalStateAdapter(threads, beads, specialty);
      expect(a).toBeInstanceOf(LocalStateAdapter);
    });
  });

  describe("searchSupplies", () => {
    it('returns matching threads for query "310"', async () => {
      const results = await adapter.searchSupplies("THREAD", "310");
      expect(results).toHaveLength(2); // "310" and "3100"
      expect(results.map((r) => r.code)).toContain("310");
      expect(results.map((r) => r.code)).toContain("3100");
    });

    it("returns empty array for no matches", async () => {
      const results = await adapter.searchSupplies("THREAD", "zz");
      expect(results).toHaveLength(0);
    });

    it("searches case-insensitively", async () => {
      const results = await adapter.searchSupplies("THREAD", "black");
      expect(results.length).toBeGreaterThanOrEqual(1);
      expect(results[0].name).toBe("Black");
    });

    it("matches on name as well as code", async () => {
      const results = await adapter.searchSupplies("THREAD", "bright");
      expect(results).toHaveLength(1);
      expect(results[0].code).toBe("666");
    });

    it("returns max 8 results", async () => {
      const manyThreads = Array.from({ length: 20 }, (_, i) =>
        makeSearchResult({ id: `t-${i}`, code: `A${i}`, name: `Thread ${i}` }),
      );
      const bigAdapter = new LocalStateAdapter(manyThreads, [], []);
      const results = await bigAdapter.searchSupplies("THREAD", "Thread");
      expect(results).toHaveLength(8);
    });

    it("searches beads when type is BEAD", async () => {
      const results = await adapter.searchSupplies("BEAD", "Red");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("b1");
    });

    it("searches specialty when type is SPECIALTY", async () => {
      const results = await adapter.searchSupplies("SPECIALTY", "Gold");
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("s1");
    });
  });

  describe("addThread", () => {
    it("adds thread to internal state and returns success", async () => {
      const result = await adapter.addThread("t1", 500, 2);
      expect(result).toEqual({ success: true });
    });
  });

  describe("addBead", () => {
    it("adds bead to internal state and returns success", async () => {
      const result = await adapter.addBead("b1", 100, 1);
      expect(result).toEqual({ success: true });
    });
  });

  describe("addSpecialty", () => {
    it("adds specialty item to internal state and returns success", async () => {
      const result = await adapter.addSpecialty("s1", 1);
      expect(result).toEqual({ success: true });
    });
  });

  describe("updateQuantity", () => {
    it("updates the correct field on an existing thread row", async () => {
      await adapter.addThread("t1", 500, 2);
      const rows = adapter.getRows();
      const threadRow = rows.find((r) => r.type === "THREAD");
      expect(threadRow).toBeDefined();

      const result = await adapter.updateQuantity("THREAD", threadRow!.id, "stitchCount", 1000);
      expect(result).toEqual({ success: true });

      const updated = adapter.getRows().find((r) => r.id === threadRow!.id);
      expect(updated?.stitchCount).toBe(1000);
    });

    it("returns failure for invalid junctionId", async () => {
      const result = await adapter.updateQuantity("THREAD", "nonexistent", "stitchCount", 500);
      expect(result).toEqual({ success: false, error: "Supply not found" });
    });
  });

  describe("remove", () => {
    it("removes item and returns success", async () => {
      await adapter.addThread("t1", 500, 2);
      const rows = adapter.getRows();
      const threadRow = rows.find((r) => r.type === "THREAD");
      expect(threadRow).toBeDefined();

      const result = await adapter.remove("THREAD", threadRow!.id);
      expect(result).toEqual({ success: true });

      const remaining = adapter.getRows().filter((r) => r.type === "THREAD");
      expect(remaining).toHaveLength(0);
    });

    it("returns failure for invalid junctionId", async () => {
      const result = await adapter.remove("THREAD", "nonexistent");
      expect(result).toEqual({ success: false, error: "Supply not found" });
    });
  });

  describe("createSupply", () => {
    it("creates a new supply and returns SupplySearchResult", async () => {
      const result = await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });

      expect(result.type).toBe("THREAD");
      expect(result.name).toBe("Custom Thread");
      expect(result.code).toBe("CT1");
      expect(result.hexColor).toBe("#FF00FF");
      expect(result.id).toBeTruthy();
    });

    it("adds created supply to the search pool", async () => {
      await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
        hexColor: "#FF00FF",
      });

      const results = await adapter.searchSupplies("THREAD", "Custom");
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Custom Thread");
    });
  });
});
