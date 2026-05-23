"use client";

import { useRef, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ArrowRight, Check, Sparkles as SparklesIcon, X } from "lucide-react";
import { SegmentedTypeToggle } from "./segmented-type-toggle";
import { PortalAutocomplete } from "./portal-autocomplete";
import { InlineCreateDialog } from "./inline-create-dialog";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import { useSupplyTable, MAX_DISPLAY_ITEMS } from "./use-supply-table";
import type { SupplyTableAdapter, CalcParams } from "./types";

interface SupplyTableAddRowProps {
  adapter: SupplyTableAdapter;
  calcParams: CalcParams;
  existingSupplyIds: Set<string>;
  onRowAdded: (newId?: string) => void;
}

const UNIT_LABELS: Record<string, string> = {
  THREAD: "sk",
  BEAD: "pkg",
  SPECIALTY: "item",
};

export function SupplyTableAddRow({
  adapter,
  calcParams,
  existingSupplyIds,
  onRowAdded,
}: SupplyTableAddRowProps) {
  const {
    supplyType,
    setSupplyType,
    searchText,
    setSearchText,
    searchResults,
    isSearching,
    isSearchError,
    selectedItem,
    selectItem,
    stitchCount,
    setStitchCount,
    need,
    setNeedManual,
    isAutoCalc,
    commitRow,
    resetAddRow,
    showCreateDialog,
    setShowCreateDialog,
    createSearchText,
    setCreateSearchText,
    handleCreateSupply,
    getFocusTarget,
    highlightIndex,
    moveHighlight,
    hasUsedArrowKeys,
  } = useSupplyTable(adapter, calcParams, existingSupplyIds);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const stitchesRef = useRef<HTMLInputElement>(null);
  const needRef = useRef<HTMLInputElement>(null);

  // Auto-focus based on focus target when item is selected
  useEffect(() => {
    if (!selectedItem) return;

    const target = getFocusTarget();
    requestAnimationFrame(() => {
      if (target === "stitches") {
        stitchesRef.current?.focus();
      } else if (target === "need") {
        needRef.current?.focus();
      }
    });
  }, [selectedItem, getFocusTarget]);

  async function handleCommit() {
    try {
      const result = await commitRow();
      if (result.success) {
        onRowAdded(result.newId);
      } else if (result.error) {
        toast.error(result.error);
      }
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    } catch (error) {
      console.error("Supply add commit failed:", error);
      toast.error("Couldn't add supply. Try again.");
    }
  }

  function handleEscape() {
    resetAddRow();
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }

  function handleFieldKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEscape();
    }
  }

  // Compute displayItems for keyboard navigation (same sorting as portal)
  const displayItems = useMemo(() => {
    const addable = searchResults.filter((item) => !existingSupplyIds.has(item.id));
    const alreadyAdded = searchResults.filter((item) => existingSupplyIds.has(item.id));
    return [...addable, ...alreadyAdded].slice(0, MAX_DISPLAY_ITEMS);
  }, [searchResults, existingSupplyIds]);

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveHighlight(1, displayItems, existingSupplyIds);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveHighlight(-1, displayItems, existingSupplyIds);
    } else if (e.key === "Enter" && highlightIndex >= 0 && displayItems[highlightIndex]) {
      e.preventDefault();
      if (!existingSupplyIds.has(displayItems[highlightIndex].id)) {
        selectItem(displayItems[highlightIndex]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleEscape();
    }
  }

  function handleCreateRequest(text: string) {
    setCreateSearchText(text);
    setShowCreateDialog(true);
  }

  function handleClearSelection() {
    resetAddRow();
    requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });
  }

  const isAutocompleteOpen =
    !selectedItem && searchText.trim().length > 0 && (searchResults.length > 0 || !isSearching);

  const inputClassName =
    "w-full border border-border rounded px-2 py-1 text-sm bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 focus:outline-none transition-colors";

  return (
    <>
      <tr
        data-testid="supply-table-add-row"
        className="bg-primary/[0.03] border-primary/20 border-b-2"
      >
        {/* Cell 1: Type toggle + Search/Selected item (41%) */}
        <td className="px-2 py-1.5" style={{ width: "41%" }}>
          {selectedItem ? (
            <div className="flex items-center gap-2">
              <ColorSwatch hexColor={selectedItem.hexColor} size="sm" />
              {selectedItem.brandName && (
                <span className="text-muted-foreground text-xs">{selectedItem.brandName}</span>
              )}
              <span className="text-foreground font-mono text-xs font-semibold">
                {selectedItem.code}
              </span>
              <span className="text-muted-foreground truncate text-xs">{selectedItem.name}</span>
              <button
                type="button"
                onClick={handleClearSelection}
                className="text-muted-foreground hover:text-foreground hover:bg-muted ml-auto shrink-0 rounded p-0.5 transition-colors"
                aria-label="Clear selection"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <SegmentedTypeToggle value={supplyType} onChange={setSupplyType} />
              <div className="relative min-w-0">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search by code or name..."
                  className={inputClassName}
                  autoComplete="off"
                  role="combobox"
                  aria-expanded={isAutocompleteOpen}
                  aria-controls="portal-autocomplete-listbox"
                  aria-activedescendant={
                    hasUsedArrowKeys && highlightIndex >= 0 && displayItems[highlightIndex]
                      ? `portal-autocomplete-item-${displayItems[highlightIndex].id}`
                      : undefined
                  }
                  aria-autocomplete="list"
                />
              </div>
            </div>
          )}

          {isSearchError && searchText.trim().length > 0 && !selectedItem && (
            <p className="text-destructive mt-1 text-xs">Search failed. Try again.</p>
          )}

          <PortalAutocomplete
            isOpen={isAutocompleteOpen}
            displayItems={displayItems}
            existingIds={existingSupplyIds}
            searchText={searchText}
            highlightIndex={highlightIndex}
            hasUsedArrowKeys={hasUsedArrowKeys}
            onSelect={selectItem}
            onCreateRequest={handleCreateRequest}
            onClose={() => setSearchText("")}
            anchorRef={searchInputRef}
            isLoading={isSearching}
          />
        </td>

        {/* Cell 2: Stitches/Qty (14%) */}
        <td className="px-2 py-1.5" style={{ width: "14%" }}>
          {selectedItem && supplyType !== "SPECIALTY" ? (
            <input
              ref={stitchesRef}
              type="number"
              min={0}
              value={stitchCount || ""}
              onChange={(e) => setStitchCount(Number(e.target.value) || 0)}
              onKeyDown={handleFieldKeyDown}
              placeholder={supplyType === "BEAD" ? "Bead count" : "Stitches"}
              aria-label={supplyType === "BEAD" ? "Bead count" : "Stitch count for thread"}
              className={inputClassName}
            />
          ) : selectedItem && supplyType === "SPECIALTY" ? (
            <span className="text-muted-foreground text-sm">--</span>
          ) : null}
        </td>

        {/* Cell 3: Arrow (24px) */}
        <td className="px-1 py-1.5" style={{ width: "24px" }}>
          {selectedItem && supplyType !== "SPECIALTY" ? (
            <ArrowRight className="text-muted-foreground h-3 w-3" />
          ) : null}
        </td>

        {/* Cell 4: Need (16%) */}
        <td className="px-2 py-1.5" style={{ width: "16%" }}>
          {selectedItem ? (
            <div className="flex items-center gap-1">
              <input
                ref={needRef}
                type="number"
                min={1}
                value={need}
                onChange={(e) => setNeedManual(Number(e.target.value) || 1)}
                onKeyDown={handleFieldKeyDown}
                className={inputClassName}
                aria-label="Need"
              />
              <span className="text-muted-foreground shrink-0 text-xs">
                {UNIT_LABELS[supplyType]}
              </span>
              {isAutoCalc && supplyType === "THREAD" && (
                <SparklesIcon
                  className="text-primary h-3 w-3 shrink-0"
                  data-testid="auto-calc-sparkle"
                />
              )}
            </div>
          ) : null}
        </td>

        {/* Cell 5: Have (10%) - empty in add row */}
        <td className="px-2 py-1.5" style={{ width: "10%" }} />

        {/* Cell 6: Status (6%) - empty in add row */}
        <td className="px-2 py-1.5" style={{ width: "6%" }} />

        {/* Cell 7: Commit button (32px) - visible when supply selected */}
        <td className="px-1 py-1.5" style={{ width: "32px" }}>
          {selectedItem && (
            <button
              type="button"
              onClick={handleCommit}
              className="text-primary hover:bg-primary/10 rounded p-1 transition-colors"
              aria-label="Add supply to table"
            >
              <Check className="h-4 w-4" />
            </button>
          )}
        </td>
      </tr>

      <InlineCreateDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSubmit={handleCreateSupply}
        supplyType={supplyType}
        defaultCode={createSearchText}
      />
    </>
  );
}
