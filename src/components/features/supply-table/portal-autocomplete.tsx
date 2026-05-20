"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Plus } from "lucide-react";
import { ColorSwatch } from "@/components/features/supplies/color-swatch";
import type { SupplySearchResult } from "./types";

interface PortalAutocompleteProps {
  isOpen: boolean;
  displayItems: SupplySearchResult[];
  existingIds: Set<string>;
  searchText: string;
  highlightIndex: number;
  hasUsedArrowKeys: boolean;
  onSelect: (item: SupplySearchResult) => void;
  onCreateRequest: (searchText: string) => void;
  onClose: () => void;
  anchorRef: React.RefObject<HTMLInputElement | null>;
  isLoading?: boolean;
}

export function PortalAutocomplete({
  isOpen,
  displayItems,
  existingIds,
  searchText,
  highlightIndex,
  hasUsedArrowKeys,
  onSelect,
  onCreateRequest,
  onClose,
  anchorRef,
  isLoading,
}: PortalAutocompleteProps) {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate position from anchor element, recalculate on scroll/resize
  useEffect(() => {
    if (!isOpen || !anchorRef.current) return;
    function updatePosition() {
      if (!anchorRef.current) return;
      const rect = anchorRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom + 4,
        left: rect.left,
        width: Math.max(320, rect.width),
      });
    }
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isOpen, anchorRef]);

  // Click-outside to dismiss dropdown (skip clicks inside the portal dropdown itself)
  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (
        anchorRef.current &&
        !anchorRef.current.contains(target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, anchorRef, onClose]);

  function isDisabled(item: SupplySearchResult): boolean {
    return existingIds.has(item.id);
  }

  if (!isOpen) return null;

  const hasSearchText = searchText.trim().length > 0;
  const showCreateOption = displayItems.length === 0 && hasSearchText && !isLoading;

  const dropdown = (
    <div
      ref={dropdownRef}
      style={{
        position: "fixed",
        top: coords.top,
        left: coords.left,
        width: coords.width,
        zIndex: 9000,
      }}
      className="border-border bg-card rounded-lg border shadow-lg"
    >
      {/* Results list (no input -- keyboard handled by parent) */}
      <div id="portal-autocomplete-listbox" role="listbox" className="max-h-60 overflow-y-auto">
        {isLoading ? (
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">Searching...</p>
        ) : displayItems.length > 0 ? (
          displayItems.map((item, index) => {
            const disabled = isDisabled(item);
            const highlighted = hasUsedArrowKeys && index === highlightIndex;
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
                    : `hover:bg-muted cursor-pointer ${highlighted ? "bg-muted" : ""}`
                }`}
              >
                <ColorSwatch hexColor={item.hexColor} size="sm" />
                <span className="min-w-0 flex-1">
                  {item.brandName && (
                    <span className="text-muted-foreground text-xs">{item.brandName}</span>
                  )}{" "}
                  <span className="text-foreground font-mono text-xs font-semibold">
                    {item.code}
                  </span>
                  {!disabled && item.name && (
                    <span className="text-muted-foreground text-xs"> &mdash; {item.name}</span>
                  )}
                </span>
                {disabled && <span className="text-muted-foreground shrink-0 text-xs">Added</span>}
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
          <p className="text-muted-foreground px-3 py-4 text-center text-sm">No matches found</p>
        ) : null}
      </div>
    </div>
  );

  return createPortal(dropdown, document.body);
}
