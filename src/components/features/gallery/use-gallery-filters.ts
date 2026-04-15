"use client";

import { useQueryState, parseAsString, parseAsStringLiteral, parseAsArrayOf } from "nuqs";
import React, { useMemo, useDeferredValue, useCallback, useEffect } from "react";
import type { GalleryCardData, ViewMode, SortField, SortDir } from "./gallery-types";
import { VIEW_MODES, SORT_FIELDS, SORT_DIRS } from "./gallery-types";
import { filterAndSort } from "./gallery-utils";

const VIEW_STORAGE_KEY = "gallery-view-mode";
const VALID_VIEWS = new Set<string>(VIEW_MODES);

// Default direction per sort field
const DEFAULT_DIR: Record<SortField, SortDir> = {
  dateAdded: "desc",
  name: "asc",
  designer: "asc",
  status: "asc",
  size: "asc",
  stitchCount: "desc",
  progress: "desc",
};

export function useGalleryFilters(cards: GalleryCardData[]) {
  // ─── URL State ──────────────────────────────────────────────────────────
  const [view, setViewRaw] = useQueryState(
    "view",
    parseAsStringLiteral([...VIEW_MODES]).withDefault("gallery"),
  );

  // Persist view mode to localStorage when changed
  const setView = useCallback(
    (v: ViewMode) => {
      void setViewRaw(v);
      try {
        localStorage.setItem(VIEW_STORAGE_KEY, v);
      } catch {
        // localStorage may be unavailable (SSR, private browsing quota)
      }
    },
    [setViewRaw],
  );

  // On mount, restore view from localStorage when no URL param is present.
  // We use a ref to capture the initial nuqs value (before any effect runs).
  // If the URL had ?view=X, nuqs will have parsed it to X (non-default).
  // We only restore from localStorage when the initial value is the default.
  const initialViewRef = React.useRef(view);
  useEffect(() => {
    if (initialViewRef.current !== "gallery") return; // URL param already set a non-default view

    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored && VALID_VIEWS.has(stored) && stored !== "gallery") {
        void setViewRaw(stored as ViewMode, { history: "replace" });
      }
    } catch {
      // localStorage unavailable
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [sort, setRawSort] = useQueryState(
    "sort",
    parseAsStringLiteral([...SORT_FIELDS]).withDefault("dateAdded"),
  );
  const [dir, setDir] = useQueryState(
    "dir",
    parseAsStringLiteral([...SORT_DIRS]).withDefault("desc"),
  );
  const [search, setSearch] = useQueryState("search", parseAsString.withDefault(""));
  const [statusFilter, setStatusFilter] = useQueryState(
    "status",
    parseAsArrayOf(parseAsString, ",").withDefault([]),
  );
  const [sizeFilter, setSizeFilter] = useQueryState(
    "size",
    parseAsArrayOf(parseAsString, ",").withDefault([]),
  );

  // ─── Derived ────────────────────────────────────────────────────────────
  const deferredSearch = useDeferredValue(search);

  const setSort = useCallback(
    (field: SortField) => {
      if (field === sort) {
        // Toggle direction on same field
        void setDir(dir === "asc" ? "desc" : "asc");
      } else {
        void setRawSort(field);
        void setDir(DEFAULT_DIR[field]);
      }
    },
    [sort, dir, setRawSort, setDir],
  );

  const toggleStatus = useCallback(
    (s: string) => {
      void setStatusFilter((prev) => {
        const current = prev ?? [];
        return current.includes(s) ? current.filter((v) => v !== s) : [...current, s];
      });
    },
    [setStatusFilter],
  );

  const toggleSize = useCallback(
    (s: string) => {
      void setSizeFilter((prev) => {
        const current = prev ?? [];
        return current.includes(s) ? current.filter((v) => v !== s) : [...current, s];
      });
    },
    [setSizeFilter],
  );

  const clearFilters = useCallback(() => {
    void setSearch("");
    void setStatusFilter([]);
    void setSizeFilter([]);
  }, [setSearch, setStatusFilter, setSizeFilter]);

  // ─── Computed ───────────────────────────────────────────────────────────
  const filteredAndSorted = useMemo(
    () =>
      filterAndSort(cards, {
        search: deferredSearch,
        statusFilter: statusFilter ?? [],
        sizeFilter: sizeFilter ?? [],
        sort,
        dir,
      }),
    [cards, deferredSearch, statusFilter, sizeFilter, sort, dir],
  );

  const hasActiveFilters =
    search !== "" || (statusFilter ?? []).length > 0 || (sizeFilter ?? []).length > 0;

  return {
    // URL state
    view: view as ViewMode,
    sort: sort as SortField,
    dir: dir as SortDir,
    search,
    statusFilter: statusFilter ?? [],
    sizeFilter: sizeFilter ?? [],

    // Setters
    setView,
    setSort,
    setDir: (d: SortDir) => void setDir(d),
    setSearch: (s: string) => void setSearch(s),
    toggleStatus,
    toggleSize,
    clearFilters,

    // Computed
    filteredAndSorted,
    totalCount: cards.length,
    filteredCount: filteredAndSorted.length,
    hasActiveFilters,
  };
}
