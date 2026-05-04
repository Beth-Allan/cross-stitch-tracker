import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import { calculateSkeins } from "@/lib/utils/skein-calculator";
import type {
  SupplyType,
  SupplyTableAdapter,
  SupplySearchResult,
  CalcParams,
  CreateSupplyData,
  Result,
} from "./types";

const DEBOUNCE_MS = 150;

/**
 * Custom hook managing the add-row state machine for the supply table.
 *
 * Handles: type selection, debounced search, item selection with focus hints,
 * auto-calculation via calculateSkeins, commit with correct adapter call,
 * and reset with sticky type toggle.
 */
export function useSupplyTable(
  adapter: SupplyTableAdapter,
  calcParams: CalcParams,
  existingSupplyIds: Set<string>,
) {
  // --- State ---
  const [supplyType, setSupplyType] = useState<SupplyType>("THREAD");
  const [searchText, setSearchTextRaw] = useState("");
  const [searchResults, setSearchResults] = useState<SupplySearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SupplySearchResult | null>(null);
  const [stitchCount, setStitchCountRaw] = useState(0);
  const [need, setNeed] = useState(1);
  const [isAutoCalc, setIsAutoCalc] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createSearchText, setCreateSearchText] = useState("");

  // Refs for debounce cleanup
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  // --- Debounced search ---
  // Using useEffect with searchText + supplyType as dependencies.
  // The 150ms debounce prevents excessive adapter.searchSupplies calls (T-10-12).
  useEffect(() => {
    // Clear previous timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Empty search text clears results immediately
    if (!searchText.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    cancelledRef.current = false;
    setIsSearching(true);

    debounceRef.current = setTimeout(async () => {
      try {
        const results = await adapter.searchSupplies(supplyType, searchText);
        if (!cancelledRef.current) {
          setSearchResults(results);
        }
      } finally {
        if (!cancelledRef.current) {
          setIsSearching(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      cancelledRef.current = true;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchText, supplyType, adapter]);

  // --- Search text setter (public API) ---
  const setSearchText = useCallback((text: string) => {
    setSearchTextRaw(text);
    if (!text.trim()) {
      setSearchResults([]);
    }
  }, []);

  // --- Auto-calc stitch count ---
  const setStitchCount = useCallback(
    (value: number) => {
      const safeValue = Math.max(0, value);
      setStitchCountRaw(safeValue);

      if (supplyType === "THREAD" && isAutoCalc && safeValue > 0) {
        const calculated = calculateSkeins({
          stitchCount: safeValue,
          strandCount: calcParams.strandCount,
          fabricCount: calcParams.fabricCount,
          overCount: calcParams.overCount,
          wastePercent: calcParams.wastePercent,
        });
        setNeed(calculated);
      }
    },
    [supplyType, isAutoCalc, calcParams],
  );

  // --- Manual need override ---
  const setNeedManual = useCallback((value: number) => {
    setNeed(Math.max(1, value));
    setIsAutoCalc(false);
  }, []);

  // --- Select item from autocomplete ---
  const selectItem = useCallback((item: SupplySearchResult) => {
    setSelectedItem(item);
    setSearchTextRaw("");
    setSearchResults([]);
    // Reset qty fields to defaults
    setStitchCountRaw(0);
    setNeed(1);
    setIsAutoCalc(true);
  }, []);

  // --- Commit add row ---
  const commitRow = useCallback(async (): Promise<{
    success: boolean;
    focusTarget: "search";
  }> => {
    if (!selectedItem) {
      return { success: false, focusTarget: "search" };
    }

    // T-10-11: Validate inputs before adapter calls
    const safeStitchCount = Math.max(0, stitchCount);
    const effectiveNeed = need > 0 ? need : 1;

    let result: Result;

    switch (supplyType) {
      case "THREAD":
        result = await adapter.addThread(selectedItem.id, safeStitchCount, effectiveNeed);
        break;
      case "BEAD":
        result = await adapter.addBead(selectedItem.id, safeStitchCount, effectiveNeed);
        break;
      case "SPECIALTY":
        result = await adapter.addSpecialty(selectedItem.id, effectiveNeed);
        break;
    }

    if (result.success) {
      // Reset for next add -- type stays sticky (SUPTBL-02)
      setSelectedItem(null);
      setSearchTextRaw("");
      setStitchCountRaw(0);
      setNeed(1);
      setIsAutoCalc(true);
      return { success: true, focusTarget: "search" };
    }

    return { success: false, focusTarget: "search" };
  }, [selectedItem, stitchCount, need, supplyType, adapter]);

  // --- Reset all add-row state ---
  const resetAddRow = useCallback(() => {
    setSelectedItem(null);
    setSearchTextRaw("");
    setSearchResults([]);
    setStitchCountRaw(0);
    setNeed(1);
    setIsAutoCalc(true);
  }, []);

  // --- Handle inline create (D-03: auto-add + refocus) ---
  const handleCreateSupply = useCallback(
    async (data: CreateSupplyData): Promise<void> => {
      try {
        const created = await adapter.createSupply(supplyType, data);
        selectItem(created);
        setShowCreateDialog(false);
      } catch {
        toast.error("Couldn't create supply. Try again.");
      }
    },
    [adapter, supplyType, selectItem],
  );

  // --- Focus target hint for the add-row component ---
  const getFocusTarget = useCallback((): "search" | "stitches" | "need" => {
    if (!selectedItem) return "search";
    if (supplyType === "SPECIALTY") return "need";
    return "stitches";
  }, [selectedItem, supplyType]);

  return {
    // Type
    supplyType,
    setSupplyType,
    // Search
    searchText,
    setSearchText,
    searchResults,
    isSearching,
    // Selection
    selectedItem,
    selectItem,
    // Quantity
    stitchCount,
    setStitchCount,
    need,
    setNeedManual,
    isAutoCalc,
    // Commit / reset
    commitRow,
    resetAddRow,
    // Create dialog
    showCreateDialog,
    setShowCreateDialog,
    createSearchText,
    setCreateSearchText,
    handleCreateSupply,
    // Focus
    getFocusTarget,
    // Existing IDs passthrough for autocomplete
    existingSupplyIds,
  };
}
