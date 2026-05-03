"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import type { SupplySearchResult } from "./types";

interface PortalAutocompleteProps {
  isOpen: boolean;
  items: SupplySearchResult[];
  existingIds: Set<string>;
  searchText: string;
  onSearchChange: (text: string) => void;
  onSelect: (item: SupplySearchResult) => void;
  onCreateRequest: (searchText: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLInputElement | null>;
  isLoading?: boolean;
}

const MAX_ITEMS = 8;

export function PortalAutocomplete({
  isOpen,
  items,
  existingIds,
  searchText,
  onSearchChange,
  onSelect,
  onCreateRequest,
  onClose,
  anchorRef,
  isLoading,
}: PortalAutocompleteProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Calculate position from anchor element
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(320, rect.width),
    });
  }, [isOpen, anchorRef]);

  // Reset highlight when items change
  useEffect(() => {
    setHighlightIndex(-1);
  }, [items]);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Sort: addable first, then already-added. Slice to max 8.
  const displayItems = useMemo(() => {
    const addable = items.filter((item) => !existingIds.has(item.id));
    const alreadyAdded = items.filter((item) => existingIds.has(item.id));
    return [...addable, ...alreadyAdded].slice(0, MAX_ITEMS);
  }, [items, existingIds]);

  function isDisabled(item: SupplySearchResult): boolean {
    return existingIds.has(item.id);
  }

  function findNextAddableIndex(fromIndex: number, direction: 1 | -1): number {
    let idx = fromIndex + direction;
    while (idx >= 0 && idx < displayItems.length) {
      if (!isDisabled(displayItems[idx])) return idx;
      idx += direction;
    }
    return fromIndex; // Stay put if no addable item found
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        if (prev < 0) {
          // Find first addable item
          for (let i = 0; i < displayItems.length; i++) {
            if (!isDisabled(displayItems[i])) return i;
          }
          return prev; // No addable items
        }
        return findNextAddableIndex(prev, 1);
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((prev) => {
        if (prev < 0) return prev;
        return findNextAddableIndex(prev, -1);
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightIndex >= 0 && displayItems[highlightIndex]) {
        if (!isDisabled(displayItems[highlightIndex])) {
          onSelect(displayItems[highlightIndex]);
        }
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  }

  if (!isOpen) return null;

  const hasSearchText = searchText.trim().length > 0;
  const showCreateOption = displayItems.length === 0 && hasSearchText && !isLoading;

  const highlightedId =
    highlightIndex >= 0 && displayItems[highlightIndex]
      ? `portal-autocomplete-item-${displayItems[highlightIndex].id}`
      : undefined;

  const dropdown = (
    <div
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9000,
      }}
      className="rounded-lg border border-border bg-card shadow-lg"
    >
      {/* Search input */}
      <div className="p-2">
        <input
          ref={inputRef}
          type="text"
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search by code or name..."
          className="border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring/40 w-full rounded border py-1.5 px-3 text-sm transition-colors focus:ring-2 focus:outline-none"
          role="combobox"
          aria-expanded={true}
          aria-controls="portal-autocomplete-listbox"
          aria-activedescendant={highlightedId || undefined}
          aria-autocomplete="list"
        />
      </div>

      {/* Results list */}
      <div
        id="portal-autocomplete-listbox"
        role="listbox"
        className="max-h-60 overflow-y-auto border-t border-border"
      >
        {isLoading ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">
            Searching...
          </p>
        ) : displayItems.length > 0 ? (
          displayItems.map((item, index) => {
            const disabled = isDisabled(item);
            const highlighted = index === highlightIndex;
            const itemId = `portal-autocomplete-item-${item.id}`;

            return (
              <div
                key={item.id}
                id={itemId}
                role="option"
                aria-selected={highlighted}
                aria-disabled={disabled || undefined}
                data-highlighted={highlighted || undefined}
                onClick={() => {
                  if (!disabled) onSelect(item);
                }}
                className={`flex w-full items-center gap-3 px-3 py-2 text-left transition-colors ${
                  disabled
                    ? "cursor-default opacity-50"
                    : `cursor-pointer hover:bg-muted ${highlighted ? "bg-muted" : ""}`
                }`}
              >
                <ColorSwatch hexColor={item.hexColor} size="sm" />
                <span className="flex-1 min-w-0">
                  <span className="font-mono text-xs font-semibold text-foreground">
                    {item.code}
                  </span>{" "}
                  <span className="text-xs text-muted-foreground truncate">
                    {disabled ? "" : item.name}
                  </span>
                </span>
                {disabled && (
                  <span className="text-muted-foreground text-xs shrink-0">
                    Added
                  </span>
                )}
              </div>
            );
          })
        ) : showCreateOption ? (
          <button
            type="button"
            onClick={() => onCreateRequest(searchText.trim())}
            className="text-primary hover:bg-muted flex w-full items-center gap-2 px-3 py-2 text-left text-sm font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create &quot;{searchText.trim()}&quot;
          </button>
        ) : hasSearchText ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">
            No matches found
          </p>
        ) : null}
      </div>
    </div>
  );

  return createPortal(dropdown, document.body);
}
