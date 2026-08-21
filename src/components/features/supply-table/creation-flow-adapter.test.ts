import { describe, it, expect, beforeEach, vi } from "vitest";
import { CreationFlowAdapter } from "./creation-flow-adapter";
import type { SupplyRow, SupplySearchResult, CreateSupplyData } from "./types";

function makeSearchResult(overrides: Partial<SupplySearchResult> = {}): SupplySearchResult {
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

describe("CreationFlowAdapter", () => {
  let onRowsChange: ReturnType<typeof vi.fn>;
  let searchFn: ReturnType<typeof vi.fn>;
  let createFn: ReturnType<typeof vi.fn>;
  let adapter: CreationFlowAdapter;

  beforeEach(() => {
    onRowsChange = vi.fn();
    searchFn = vi.fn();
    createFn = vi.fn();
    adapter = new CreationFlowAdapter(onRowsChange, searchFn, createFn);
  });

  describe("addThread", () => {
    it("stores row in buffer with client-generated UUID and calls onRowsChange", async () => {
      // Pre-populate cache via searchSupplies
      const threadResult = makeSearchResult({
        id: "t1",
        type: "THREAD",
        code: "310",
        name: "Black",
      });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");

      const result = await adapter.addThread("t1", 500, 2);

      expect(result).toEqual({ success: true, id: expect.any(String) });
      expect(onRowsChange).toHaveBeenCalledTimes(1);

      const rows = adapter.getRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].supplyId).toBe("t1");
      expect(rows[0].type).toBe("THREAD");
      expect(rows[0].stitchCount).toBe(500);
      expect(rows[0].need).toBe(2);
      expect(rows[0].have).toBe(0);
      expect(rows[0].isNeedOverridden).toBe(false);
      expect(rows[0].code).toBe("310");
      expect(rows[0].name).toBe("Black");
    });
  });

  describe("addBead", () => {
    it("stores bead row in buffer and calls onRowsChange", async () => {
      const beadResult = makeSearchResult({
        id: "b1",
        type: "BEAD",
        code: "00123",
        name: "Red",
        brandName: "Mill Hill",
      });
      searchFn.mockResolvedValueOnce([beadResult]);
      await adapter.searchSupplies("BEAD", "Red");

      const result = await adapter.addBead("b1", 100, 1);

      expect(result).toEqual({ success: true, id: expect.any(String) });
      expect(onRowsChange).toHaveBeenCalledTimes(1);

      const rows = adapter.getRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].type).toBe("BEAD");
      expect(rows[0].stitchCount).toBe(0);
      expect(rows[0].need).toBe(1);
    });
  });

  describe("addSpecialty", () => {
    it("stores specialty row in buffer and calls onRowsChange", async () => {
      const specialtyResult = makeSearchResult({
        id: "s1",
        type: "SPECIALTY",
        code: "K001",
        name: "Gold Braid",
        brandName: "Kreinik",
      });
      searchFn.mockResolvedValueOnce([specialtyResult]);
      await adapter.searchSupplies("SPECIALTY", "Gold");

      const result = await adapter.addSpecialty("s1", 1);

      expect(result).toEqual({ success: true, id: expect.any(String) });
      expect(onRowsChange).toHaveBeenCalledTimes(1);

      const rows = adapter.getRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].type).toBe("SPECIALTY");
      expect(rows[0].stitchCount).toBe(0);
    });
  });

  describe("updateQuantity", () => {
    it("mutates buffered row's field and calls onRowsChange", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");

      const addResult = await adapter.addThread("t1", 500, 2);
      const rowId = (addResult as { success: true; id: string }).id;
      onRowsChange.mockClear();

      const updateResult = await adapter.updateQuantity("THREAD", rowId, "stitchCount", 1000);

      expect(updateResult).toEqual({ success: true });
      expect(onRowsChange).toHaveBeenCalledTimes(1);

      const rows = adapter.getRows();
      const updated = rows.find((r) => r.id === rowId);
      expect(updated?.stitchCount).toBe(1000);
    });

    it("returns error for non-existent row", async () => {
      const result = await adapter.updateQuantity("THREAD", "nonexistent", "need", 5);
      expect(result).toEqual({ success: false, error: "Supply not found" });
    });
  });

  describe("remove", () => {
    it("deletes row from buffer and calls onRowsChange", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");

      const addResult = await adapter.addThread("t1", 500, 2);
      const rowId = (addResult as { success: true; id: string }).id;
      onRowsChange.mockClear();

      const removeResult = await adapter.remove("THREAD", rowId);

      expect(removeResult).toEqual({ success: true });
      expect(onRowsChange).toHaveBeenCalledTimes(1);
      expect(adapter.getRows()).toHaveLength(0);
    });

    it("returns error for non-existent row", async () => {
      const result = await adapter.remove("THREAD", "nonexistent");
      expect(result).toEqual({ success: false, error: "Supply not found" });
    });
  });

  describe("searchSupplies", () => {
    it("delegates to provided searchFn", async () => {
      const results = [makeSearchResult()];
      searchFn.mockResolvedValueOnce(results);

      const returned = await adapter.searchSupplies("THREAD", "310");

      expect(searchFn).toHaveBeenCalledWith("THREAD", "310");
      expect(returned).toEqual(results);
    });
  });

  describe("createSupply", () => {
    it("delegates to provided createFn and returns SupplySearchResult", async () => {
      const created = makeSearchResult({ id: "new-1", code: "CT1", name: "Custom Thread" });
      createFn.mockResolvedValueOnce(created);

      const data: CreateSupplyData = { name: "Custom Thread", code: "CT1", brandId: "brand-1" };
      const result = await adapter.createSupply("THREAD", data);

      expect(createFn).toHaveBeenCalledWith("THREAD", data);
      expect(result).toEqual(created);
    });

    it("populates supply cache so addThread can resolve metadata", async () => {
      const created = makeSearchResult({
        id: "new-1",
        code: "CT1",
        name: "Custom Thread",
        hexColor: "#FF00FF",
      });
      createFn.mockResolvedValueOnce(created);

      await adapter.createSupply("THREAD", {
        name: "Custom Thread",
        code: "CT1",
        brandId: "brand-1",
      });
      const addResult = await adapter.addThread("new-1", 100, 1);

      expect(addResult.success).toBe(true);
      const rows = adapter.getRows();
      expect(rows[0].code).toBe("CT1");
      expect(rows[0].name).toBe("Custom Thread");
      expect(rows[0].hexColor).toBe("#FF00FF");
    });
  });

  describe("getRows", () => {
    it("returns all buffered rows across all types", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");
      await adapter.addThread("t1", 500, 2);

      const beadResult = makeSearchResult({ id: "b1", type: "BEAD", code: "00123", name: "Red" });
      searchFn.mockResolvedValueOnce([beadResult]);
      await adapter.searchSupplies("BEAD", "Red");
      await adapter.addBead("b1", 100, 1);

      const specialtyResult = makeSearchResult({
        id: "s1",
        type: "SPECIALTY",
        code: "K001",
        name: "Gold",
      });
      searchFn.mockResolvedValueOnce([specialtyResult]);
      await adapter.searchSupplies("SPECIALTY", "Gold");
      await adapter.addSpecialty("s1", 1);

      const rows = adapter.getRows();
      expect(rows).toHaveLength(3);

      const types = rows.map((r) => r.type);
      expect(types).toContain("THREAD");
      expect(types).toContain("BEAD");
      expect(types).toContain("SPECIALTY");
    });
  });

  describe("loadRows", () => {
    it("populates buffer from serialized array (draft restore scenario)", () => {
      const existingRows: SupplyRow[] = [
        {
          id: "row-1",
          supplyId: "t1",
          type: "THREAD",
          code: "310",
          name: "Black",
          brandName: "DMC",
          hexColor: "#000000",
          stitchCount: 500,
          need: 2,
          have: 0,
          isNeedOverridden: false,
        },
        {
          id: "row-2",
          supplyId: "b1",
          type: "BEAD",
          code: "00123",
          name: "Red",
          brandName: "Mill Hill",
          hexColor: "#FF0000",
          stitchCount: 0,
          need: 1,
          have: 0,
          isNeedOverridden: false,
        },
      ];

      adapter.loadRows(existingRows);

      expect(onRowsChange).toHaveBeenCalledTimes(1);
      const rows = adapter.getRows();
      expect(rows).toHaveLength(2);
      expect(rows[0].id).toBe("row-1");
      expect(rows[1].id).toBe("row-2");
    });

    it("clears existing rows before loading", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");
      await adapter.addThread("t1", 500, 2);

      expect(adapter.getRows()).toHaveLength(1);

      const newRows: SupplyRow[] = [
        {
          id: "row-new",
          supplyId: "t2",
          type: "THREAD",
          code: "666",
          name: "Bright Red",
          brandName: "DMC",
          hexColor: "#CC0000",
          stitchCount: 200,
          need: 1,
          have: 0,
          isNeedOverridden: false,
        },
      ];

      adapter.loadRows(newRows);

      const rows = adapter.getRows();
      expect(rows).toHaveLength(1);
      expect(rows[0].id).toBe("row-new");
    });
  });

  describe("duplicate detection", () => {
    it("returns error when adding duplicate supplyId of same type", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");

      const first = await adapter.addThread("t1", 500, 2);
      expect(first.success).toBe(true);

      const second = await adapter.addThread("t1", 300, 1);
      expect(second).toEqual({ success: false, error: "Supply already added" });
      expect(adapter.getRows()).toHaveLength(1);
    });

    it("allows same supplyId for different types", async () => {
      // Edge case: same ID across types should be allowed
      const threadResult = makeSearchResult({ id: "shared-1", type: "THREAD" });
      const beadResult = makeSearchResult({ id: "shared-1", type: "BEAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "x");
      searchFn.mockResolvedValueOnce([beadResult]);
      await adapter.searchSupplies("BEAD", "x");

      const first = await adapter.addThread("shared-1", 500, 2);
      expect(first.success).toBe(true);

      const second = await adapter.addBead("shared-1", 100, 1);
      expect(second.success).toBe(true);

      expect(adapter.getRows()).toHaveLength(2);
    });
  });

  describe("updateQuantity recalculation", () => {
    it("recalculates need via calculateSkeins when stitchCount changes on a non-overridden thread row", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");
      const addResult = await adapter.addThread("t1", 500, 2);
      const rowId = (addResult as { success: true; id: string }).id;

      // Set calc params so recalculation can happen
      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });
      onRowsChange.mockClear();

      await adapter.updateQuantity("THREAD", rowId, "stitchCount", 1000);

      const rows = adapter.getRows();
      const updated = rows.find((r) => r.id === rowId);
      expect(updated?.stitchCount).toBe(1000);
      // calculateSkeins({ stitchCount: 1000, strandCount: 2, fabricCount: 14, overCount: 1, wastePercent: 20 })
      // = ceil(1000 * 2 * 1.2 / (14 * 255)) = ceil(2400 / 3570) = ceil(0.672) = 1
      expect(updated?.need).toBe(1);
    });

    it("marks a hand-typed need as overridden and stops recalculating it", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");
      const addResult = await adapter.addThread("t1", 500, 2);
      const rowId = (addResult as { success: true; id: string }).id;

      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });

      await adapter.updateQuantity("THREAD", rowId, "need", 10);
      expect(adapter.getRows().find((r) => r.id === rowId)?.isNeedOverridden).toBe(true);

      await adapter.updateQuantity("THREAD", rowId, "stitchCount", 1000);

      const updated = adapter.getRows().find((r) => r.id === rowId);
      expect(updated?.stitchCount).toBe(1000);
      // The calculation would have made this 1 -- the hand-typed 10 is what must survive.
      expect(updated?.need).toBe(10);
    });

    it("does NOT recalculate need for a restored draft row that was already overridden", async () => {
      adapter.loadRows([
        {
          id: "row-1",
          supplyId: "t1",
          type: "THREAD",
          code: "310",
          name: "Black",
          brandName: "DMC",
          hexColor: "#000000",
          stitchCount: 500,
          need: 10,
          have: 0,
          isNeedOverridden: true,
        },
      ]);

      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });
      onRowsChange.mockClear();

      await adapter.updateQuantity("THREAD", "row-1", "stitchCount", 1000);

      const updated = adapter.getRows().find((r) => r.id === "row-1");
      expect(updated?.stitchCount).toBe(1000);
      expect(updated?.need).toBe(10);
    });

    it("does NOT recalculate need when field is 'need' or 'have' (unchanged behavior)", async () => {
      const threadResult = makeSearchResult({ id: "t1", type: "THREAD" });
      searchFn.mockResolvedValueOnce([threadResult]);
      await adapter.searchSupplies("THREAD", "310");
      const addResult = await adapter.addThread("t1", 500, 2);
      const rowId = (addResult as { success: true; id: string }).id;

      adapter.setCalcParams({ fabricCount: 14, strandCount: 2, overCount: 1, wastePercent: 20 });
      onRowsChange.mockClear();

      // Update "need" field - should just set the value directly
      await adapter.updateQuantity("THREAD", rowId, "need", 99);
      const rows1 = adapter.getRows();
      expect(rows1.find((r) => r.id === rowId)?.need).toBe(99);

      // Update "have" field - should just set the value directly
      await adapter.updateQuantity("THREAD", rowId, "have", 5);
      const rows2 = adapter.getRows();
      expect(rows2.find((r) => r.id === rowId)?.have).toBe(5);
      // need should still be 99
      expect(rows2.find((r) => r.id === rowId)?.need).toBe(99);
    });
  });

  describe("supply cache fallback", () => {
    it("uses fallback metadata when supply not in cache", async () => {
      // Add without prior search — supply won't be in cache
      const result = await adapter.addThread("unknown-id", 100, 1);

      expect(result.success).toBe(true);
      const rows = adapter.getRows();
      expect(rows[0].code).toBe("");
      expect(rows[0].name).toBe("Unknown");
      expect(rows[0].hexColor).toBe("#000000");
    });
  });
});
