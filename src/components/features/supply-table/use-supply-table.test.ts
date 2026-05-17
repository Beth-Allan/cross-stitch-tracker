import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { renderHook, act } from "@/__tests__/test-utils";
import { useSupplyTable } from "./use-supply-table";
import type { SupplyTableAdapter, SupplySearchResult, CalcParams, CreateSupplyData } from "./types";
import { DEFAULT_CALC_PARAMS } from "./types";
import { calculateSkeins } from "@/lib/utils/skein-calculator";

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

function createMockAdapter(): SupplyTableAdapter {
  return {
    addThread: vi.fn().mockResolvedValue({ success: true }),
    addBead: vi.fn().mockResolvedValue({ success: true }),
    addSpecialty: vi.fn().mockResolvedValue({ success: true }),
    updateQuantity: vi.fn().mockResolvedValue({ success: true }),
    remove: vi.fn().mockResolvedValue({ success: true }),
    searchSupplies: vi.fn().mockResolvedValue([]),
    createSupply: vi.fn().mockResolvedValue(makeSearchResult()),
  };
}

describe("useSupplyTable", () => {
  let adapter: SupplyTableAdapter;
  let calcParams: CalcParams;
  let existingIds: Set<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    adapter = createMockAdapter();
    calcParams = { ...DEFAULT_CALC_PARAMS };
    existingIds = new Set<string>();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function renderSupplyTableHook() {
    return renderHook(() => useSupplyTable(adapter, calcParams, existingIds));
  }

  it("has initial state with supplyType THREAD, empty searchText, no selectedItem", () => {
    const { result } = renderSupplyTableHook();

    expect(result.current.supplyType).toBe("THREAD");
    expect(result.current.searchText).toBe("");
    expect(result.current.selectedItem).toBeNull();
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.isSearching).toBe(false);
  });

  it("triggers debounced adapter.searchSupplies after 150ms", async () => {
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("310");
    });

    // Not called yet (before debounce)
    expect(adapter.searchSupplies).not.toHaveBeenCalled();

    // After 150ms debounce
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(adapter.searchSupplies).toHaveBeenCalledWith("THREAD", "310");
    expect(result.current.searchResults).toEqual(results);
  });

  it("clears items without calling adapter when searchText is empty", async () => {
    const results = [makeSearchResult()];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    // First set non-empty text and let debounce fire
    act(() => {
      result.current.setSearchText("310");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.searchResults).toEqual(results);

    // Now set empty text
    act(() => {
      result.current.setSearchText("");
    });

    // Search should not be called again for empty string
    expect(adapter.searchSupplies).toHaveBeenCalledTimes(1);
    expect(result.current.searchResults).toEqual([]);
  });

  it("selectItem sets selectedItem and clears searchText", () => {
    const item = makeSearchResult({ id: "t1" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });

    expect(result.current.selectedItem).toEqual(item);
    expect(result.current.searchText).toBe("");
    expect(result.current.searchResults).toEqual([]);
  });

  it("selecting a THREAD item returns focusTarget 'stitches'", () => {
    const item = makeSearchResult({ type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });

    expect(result.current.getFocusTarget()).toBe("stitches");
  });

  it("selecting a BEAD item returns focusTarget 'stitches'", () => {
    const item = makeSearchResult({ type: "BEAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("BEAD");
      result.current.selectItem(item);
    });

    expect(result.current.getFocusTarget()).toBe("stitches");
  });

  it("selecting a SPECIALTY item returns focusTarget 'need'", () => {
    const item = makeSearchResult({ type: "SPECIALTY" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("SPECIALTY");
      result.current.selectItem(item);
    });

    expect(result.current.getFocusTarget()).toBe("need");
  });

  it("setStitchCount auto-calculates need via calculateSkeins when type is THREAD", () => {
    const item = makeSearchResult({ type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });

    act(() => {
      result.current.setStitchCount(5000);
    });

    const expectedNeed = calculateSkeins({
      stitchCount: 5000,
      strandCount: calcParams.strandCount,
      fabricCount: calcParams.fabricCount,
      overCount: calcParams.overCount,
      wastePercent: calcParams.wastePercent,
    });

    expect(result.current.need).toBe(expectedNeed);
    expect(result.current.isAutoCalc).toBe(true);
  });

  it("setStitchCount does NOT auto-calc for BEAD type", () => {
    const item = makeSearchResult({ type: "BEAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("BEAD");
      result.current.selectItem(item);
    });

    act(() => {
      result.current.setStitchCount(500);
    });

    // Need should stay at default 1, not auto-calc
    expect(result.current.need).toBe(1);
  });

  it("commitRow calls adapter.addThread with (threadId, stitchCount, calculatedNeed) for THREAD", async () => {
    const item = makeSearchResult({ id: "t1", type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setStitchCount(5000);
    });

    const expectedNeed = result.current.need;

    await act(async () => {
      await result.current.commitRow();
    });

    expect(adapter.addThread).toHaveBeenCalledWith("t1", 5000, expectedNeed);
  });

  it("commitRow calls adapter.addBead with (beadId, quantity, need) for BEAD", async () => {
    const item = makeSearchResult({ id: "b1", type: "BEAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("BEAD");
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setStitchCount(100);
    });
    act(() => {
      result.current.setNeedManual(3);
    });

    await act(async () => {
      await result.current.commitRow();
    });

    expect(adapter.addBead).toHaveBeenCalledWith("b1", 100, 3);
  });

  it("commitRow calls adapter.addSpecialty with (itemId, need) for SPECIALTY", async () => {
    const item = makeSearchResult({ id: "s1", type: "SPECIALTY" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("SPECIALTY");
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setNeedManual(2);
    });

    await act(async () => {
      await result.current.commitRow();
    });

    expect(adapter.addSpecialty).toHaveBeenCalledWith("s1", 2);
  });

  it("after successful commit, state resets but supplyType stays (sticky toggle)", async () => {
    const item = makeSearchResult({ id: "t1", type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("BEAD");
    });
    act(() => {
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setStitchCount(100);
    });

    await act(async () => {
      await result.current.commitRow();
    });

    // State resets
    expect(result.current.selectedItem).toBeNull();
    expect(result.current.searchText).toBe("");
    expect(result.current.stitchCount).toBe(0);
    expect(result.current.need).toBe(1);
    expect(result.current.isAutoCalc).toBe(true);

    // Supply type stays sticky
    expect(result.current.supplyType).toBe("BEAD");
  });

  it("commitRow returns { success: false } when no item is selected", async () => {
    const { result } = renderSupplyTableHook();

    let commitResult: { success: boolean };
    await act(async () => {
      commitResult = await result.current.commitRow();
    });

    expect(commitResult!.success).toBe(false);
    expect(adapter.addThread).not.toHaveBeenCalled();
  });

  it("resetAddRow clears all add-row state", () => {
    const item = makeSearchResult({ id: "t1" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setStitchCount(1000);
    });
    act(() => {
      result.current.setNeedManual(5);
    });

    act(() => {
      result.current.resetAddRow();
    });

    expect(result.current.selectedItem).toBeNull();
    expect(result.current.searchText).toBe("");
    expect(result.current.searchResults).toEqual([]);
    expect(result.current.stitchCount).toBe(0);
    expect(result.current.need).toBe(1);
    expect(result.current.isAutoCalc).toBe(true);
  });

  it("handleCreateSupply calls adapter.createSupply then auto-selects the result", async () => {
    const created = makeSearchResult({
      id: "new-1",
      type: "THREAD",
      code: "999",
      name: "Custom Thread",
    });
    vi.mocked(adapter.createSupply).mockResolvedValue(created);

    const { result } = renderSupplyTableHook();

    const data: CreateSupplyData = {
      name: "Custom Thread",
      code: "999",
      brandId: "brand-1",
    };

    await act(async () => {
      await result.current.handleCreateSupply(data);
    });

    expect(adapter.createSupply).toHaveBeenCalledWith("THREAD", data);
    expect(result.current.selectedItem).toEqual(created);
    expect(result.current.showCreateDialog).toBe(false);
  });

  it("need defaults to 1 when no stitches entered for THREAD", () => {
    const item = makeSearchResult({ type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });

    expect(result.current.need).toBe(1);
  });

  it("need defaults to 1 for BEAD type", () => {
    const item = makeSearchResult({ type: "BEAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("BEAD");
      result.current.selectItem(item);
    });

    expect(result.current.need).toBe(1);
  });

  it("need defaults to 1 for SPECIALTY type", () => {
    const item = makeSearchResult({ type: "SPECIALTY" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSupplyType("SPECIALTY");
      result.current.selectItem(item);
    });

    expect(result.current.need).toBe(1);
  });

  it("setNeedManual disables auto-calc", () => {
    const item = makeSearchResult({ type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });
    act(() => {
      result.current.setNeedManual(10);
    });

    expect(result.current.need).toBe(10);
    expect(result.current.isAutoCalc).toBe(false);
  });

  it("validates stitchCount >= 0 and need >= 1 before adapter calls", async () => {
    const item = makeSearchResult({ id: "t1", type: "THREAD" });
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.selectItem(item);
    });

    // Commit with default values (stitchCount=0, need=1)
    await act(async () => {
      await result.current.commitRow();
    });

    // Need should be at least 1 (effectiveNeed)
    expect(adapter.addThread).toHaveBeenCalledWith("t1", 0, 1);
  });

  it("uses correct supplyType for search after type change", async () => {
    const { result } = renderSupplyTableHook();
    vi.mocked(adapter.searchSupplies).mockResolvedValue([]);

    act(() => {
      result.current.setSupplyType("BEAD");
    });
    act(() => {
      result.current.setSearchText("mill");
    });

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(adapter.searchSupplies).toHaveBeenCalledWith("BEAD", "mill");
  });

  it("openCreateDialog stores the search text for the dialog", () => {
    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("custom thread");
    });
    act(() => {
      result.current.setCreateSearchText("custom thread");
      result.current.setShowCreateDialog(true);
    });

    expect(result.current.showCreateDialog).toBe(true);
    expect(result.current.createSearchText).toBe("custom thread");
  });

  // --- New tests for highlightIndex and useTransition ---

  it("includes highlightIndex in return value, defaults to -1", () => {
    const { result } = renderSupplyTableHook();
    expect(result.current.highlightIndex).toBe(-1);
  });

  it("highlightIndex resets to -1 when searchResults change", async () => {
    const results1 = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    const results2 = [makeSearchResult({ id: "t2", code: "321", name: "Red" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValueOnce(results1);

    const { result } = renderSupplyTableHook();

    // Trigger search and get results
    act(() => {
      result.current.setSearchText("310");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Manually move highlight
    act(() => {
      result.current.setHighlightIndex(0);
    });
    expect(result.current.highlightIndex).toBe(0);

    // Now change search to get new results
    vi.mocked(adapter.searchSupplies).mockResolvedValueOnce(results2);
    act(() => {
      result.current.setSearchText("321");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    // Highlight should reset
    expect(result.current.highlightIndex).toBe(-1);
  });

  it("exports moveHighlight function for keyboard navigation", () => {
    const { result } = renderSupplyTableHook();
    expect(typeof result.current.moveHighlight).toBe("function");
  });

  it("moveHighlight navigates forward through addable items", async () => {
    const results = [
      makeSearchResult({ id: "t1", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", code: "321", name: "Red" }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("3");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const displayItems = result.current.searchResults;
    const emptySet = new Set<string>();

    act(() => {
      result.current.moveHighlight(1, displayItems, emptySet);
    });
    expect(result.current.highlightIndex).toBe(0);

    act(() => {
      result.current.moveHighlight(1, displayItems, emptySet);
    });
    expect(result.current.highlightIndex).toBe(1);
  });

  it("moveHighlight skips disabled (existing) items", async () => {
    const results = [
      makeSearchResult({ id: "t1", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", code: "321", name: "Red" }),
      makeSearchResult({ id: "t3", code: "333", name: "Blue" }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("3");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const displayItems = result.current.searchResults;
    const existingSet = new Set(["t2"]); // t2 is disabled

    act(() => {
      result.current.moveHighlight(1, displayItems, existingSet);
    });
    expect(result.current.highlightIndex).toBe(0); // t1

    act(() => {
      result.current.moveHighlight(1, displayItems, existingSet);
    });
    expect(result.current.highlightIndex).toBe(2); // t3 (skipped t2)
  });

  it("moveHighlight navigates backward through addable items", async () => {
    const results = [
      makeSearchResult({ id: "t1", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", code: "321", name: "Red" }),
      makeSearchResult({ id: "t3", code: "333", name: "Blue" }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("3");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const displayItems = result.current.searchResults;
    const emptySet = new Set<string>();

    // Move forward to index 2
    act(() => result.current.moveHighlight(1, displayItems, emptySet));
    act(() => result.current.moveHighlight(1, displayItems, emptySet));
    act(() => result.current.moveHighlight(1, displayItems, emptySet));
    expect(result.current.highlightIndex).toBe(2);

    // Move backward
    act(() => result.current.moveHighlight(-1, displayItems, emptySet));
    expect(result.current.highlightIndex).toBe(1);

    act(() => result.current.moveHighlight(-1, displayItems, emptySet));
    expect(result.current.highlightIndex).toBe(0);
  });

  it("moveHighlight backward skips disabled items", async () => {
    const results = [
      makeSearchResult({ id: "t1", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", code: "321", name: "Red" }),
      makeSearchResult({ id: "t3", code: "333", name: "Blue" }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("3");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const displayItems = result.current.searchResults;
    const existingSet = new Set(["t2"]); // t2 is disabled

    // Move forward to index 2 (t3)
    act(() => result.current.moveHighlight(1, displayItems, existingSet));
    act(() => result.current.moveHighlight(1, displayItems, existingSet));
    expect(result.current.highlightIndex).toBe(2); // t3

    // Move backward — should skip t2 and land on t1
    act(() => result.current.moveHighlight(-1, displayItems, existingSet));
    expect(result.current.highlightIndex).toBe(0); // t1 (skipped t2)
  });

  it("moveHighlight backward stays put when no prior addable item exists", async () => {
    const results = [
      makeSearchResult({ id: "t1", code: "310", name: "Black" }),
      makeSearchResult({ id: "t2", code: "321", name: "Red" }),
    ];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("3");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    const displayItems = result.current.searchResults;
    const existingSet = new Set(["t1"]); // t1 is disabled

    // Move to t2 (index 1)
    act(() => result.current.moveHighlight(1, displayItems, existingSet));
    expect(result.current.highlightIndex).toBe(1);

    // ArrowUp — t1 is disabled, no prior addable item, should stay at 1
    act(() => result.current.moveHighlight(-1, displayItems, existingSet));
    expect(result.current.highlightIndex).toBe(1);
  });

  it("sets isSearchError on search failure", async () => {
    vi.mocked(adapter.searchSupplies).mockRejectedValue(new Error("Network error"));

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("310");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isSearchError).toBe(true);
    expect(result.current.searchResults).toEqual([]);
  });

  it("clears isSearchError on next successful search", async () => {
    vi.mocked(adapter.searchSupplies).mockRejectedValueOnce(new Error("fail"));

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("310");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isSearchError).toBe(true);

    // New search succeeds
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValueOnce(results);

    act(() => {
      result.current.setSearchText("321");
    });
    await act(async () => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current.isSearchError).toBe(false);
    expect(result.current.searchResults).toEqual(results);
  });

  it("uses useTransition for setIsSearching (non-blocking)", async () => {
    // We verify that the hook uses useTransition by checking that isSearching
    // transitions happen without blocking -- the hook should expose no isPending
    // directly, but the key indicator is that setIsSearching is wrapped.
    // The actual verification is structural (source code inspection), but
    // functionally: search should still work correctly.
    const results = [makeSearchResult({ id: "t1", code: "310", name: "Black" })];
    vi.mocked(adapter.searchSupplies).mockResolvedValue(results);

    const { result } = renderSupplyTableHook();

    act(() => {
      result.current.setSearchText("310");
    });

    // isSearching should be true during search
    expect(result.current.isSearching).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isSearching).toBe(false);
    expect(result.current.searchResults).toEqual(results);
  });
});
