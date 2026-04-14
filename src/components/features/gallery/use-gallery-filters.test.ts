import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { useGalleryFilters } from "./use-gallery-filters";
import { filterAndSort } from "./gallery-utils";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";

// ─── filterAndSort (pure function) ─────────────────────────────────────────

describe("filterAndSort", () => {
  const cards = [
    createMockGalleryCard({
      name: "Alpha Stitch",
      status: "IN_PROGRESS",
      sizeCategory: "Large",
      stitchCount: 30000,
      dateAdded: new Date("2026-01-01"),
    }),
    createMockGalleryCard({
      name: "Beta Cross",
      status: "UNSTARTED",
      sizeCategory: "Mini",
      stitchCount: 500,
      dateAdded: new Date("2026-03-01"),
    }),
    createMockGalleryCard({
      name: "Gamma Thread",
      status: "FINISHED",
      sizeCategory: "BAP",
      stitchCount: 60000,
      dateAdded: new Date("2026-02-01"),
    }),
    createMockGalleryCard({
      name: "Delta Pattern",
      status: "IN_PROGRESS",
      sizeCategory: "Medium",
      stitchCount: 10000,
      dateAdded: new Date("2026-04-01"),
    }),
  ];

  it("returns all cards when no filters active", () => {
    const result = filterAndSort(cards, {
      search: "",
      statusFilter: [],
      sizeFilter: [],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(4);
  });

  it("filters by search text matching name (case-insensitive)", () => {
    const result = filterAndSort(cards, {
      search: "stitch",
      statusFilter: [],
      sizeFilter: [],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Alpha Stitch");
  });

  it("filters by search text matching designer name", () => {
    const cardsWithDesigner = [
      createMockGalleryCard({
        name: "Woodland Sampler",
        designerName: "Mirabilia Designs",
        dateAdded: new Date("2026-01-01"),
      }),
      createMockGalleryCard({
        name: "Ocean Dreams",
        designerName: "Ink Circles",
        dateAdded: new Date("2026-02-01"),
      }),
      createMockGalleryCard({
        name: "Mirabilia Garden",
        designerName: "Other Designer",
        dateAdded: new Date("2026-03-01"),
      }),
    ];
    const result = filterAndSort(cardsWithDesigner, {
      search: "mirabilia",
      statusFilter: [],
      sizeFilter: [],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.name).sort()).toEqual(["Mirabilia Garden", "Woodland Sampler"]);
  });

  it("filters by status array", () => {
    const result = filterAndSort(cards, {
      search: "",
      statusFilter: ["IN_PROGRESS"],
      sizeFilter: [],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.status === "IN_PROGRESS")).toBe(true);
  });

  it("filters by size array", () => {
    const result = filterAndSort(cards, {
      search: "",
      statusFilter: [],
      sizeFilter: ["BAP"],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Gamma Thread");
  });

  it("combines all filters with AND logic", () => {
    const result = filterAndSort(cards, {
      search: "pattern",
      statusFilter: ["IN_PROGRESS"],
      sizeFilter: ["Medium"],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Delta Pattern");
  });

  it("applies sort after filtering", () => {
    const result = filterAndSort(cards, {
      search: "",
      statusFilter: ["IN_PROGRESS"],
      sizeFilter: [],
      sort: "name",
      dir: "asc",
    });
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Alpha Stitch");
    expect(result[1].name).toBe("Delta Pattern");
  });

  it("sorts by dateAdded descending (newest first)", () => {
    const result = filterAndSort(cards, {
      search: "",
      statusFilter: [],
      sizeFilter: [],
      sort: "dateAdded",
      dir: "desc",
    });
    expect(result[0].name).toBe("Delta Pattern"); // April
    expect(result[3].name).toBe("Alpha Stitch"); // January
  });

  it("returns empty array when no cards match", () => {
    const result = filterAndSort(cards, {
      search: "nonexistent",
      statusFilter: [],
      sizeFilter: [],
      sort: "name",
      dir: "asc",
    });
    expect(result).toHaveLength(0);
  });
});

// ─── useGalleryFilters (hook integration) ───────────────────────────────────

describe("useGalleryFilters", () => {
  const cards = [
    createMockGalleryCard({
      chartId: "c1",
      name: "Alpha",
      status: "IN_PROGRESS",
      sizeCategory: "Large",
      dateAdded: new Date("2026-01-01"),
    }),
    createMockGalleryCard({
      chartId: "c2",
      name: "Beta",
      status: "UNSTARTED",
      sizeCategory: "Mini",
      dateAdded: new Date("2026-03-01"),
    }),
    createMockGalleryCard({
      chartId: "c3",
      name: "Gamma",
      status: "FINISHED",
      sizeCategory: "BAP",
      dateAdded: new Date("2026-02-01"),
    }),
  ];

  it("returns default state values", () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    expect(result.current.view).toBe("gallery");
    expect(result.current.sort).toBe("dateAdded");
    expect(result.current.dir).toBe("desc");
    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toEqual([]);
    expect(result.current.sizeFilter).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
    expect(result.current.totalCount).toBe(3);
    expect(result.current.filteredCount).toBe(3);
  });

  it("setView updates view mode", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.setView("list"));
    expect(result.current.view).toBe("list");
  });

  it("setSearch filters cards and sets hasActiveFilters", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.setSearch("alpha"));
    expect(result.current.search).toBe("alpha");
    expect(result.current.hasActiveFilters).toBe(true);
  });

  it("toggleStatus adds and removes status from filter", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.toggleStatus("IN_PROGRESS"));
    expect(result.current.statusFilter).toEqual(["IN_PROGRESS"]);
    expect(result.current.hasActiveFilters).toBe(true);

    await act(() => result.current.toggleStatus("IN_PROGRESS"));
    expect(result.current.statusFilter).toEqual([]);
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("toggleSize adds and removes size from filter", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.toggleSize("BAP"));
    expect(result.current.sizeFilter).toEqual(["BAP"]);

    await act(() => result.current.toggleSize("BAP"));
    expect(result.current.sizeFilter).toEqual([]);
  });

  it("clearFilters resets search, status, and size but not view/sort", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.setView("list"));
    await act(() => result.current.setSearch("alpha"));
    await act(() => result.current.toggleStatus("IN_PROGRESS"));
    await act(() => result.current.toggleSize("Large"));

    await act(() => result.current.clearFilters());

    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toEqual([]);
    expect(result.current.sizeFilter).toEqual([]);
    expect(result.current.view).toBe("list"); // NOT reset
    expect(result.current.hasActiveFilters).toBe(false);
  });

  it("setSort toggles direction when same field clicked", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    // Default: dateAdded desc
    expect(result.current.sort).toBe("dateAdded");
    expect(result.current.dir).toBe("desc");

    // Click same field: toggles to asc
    await act(() => result.current.setSort("dateAdded"));
    expect(result.current.dir).toBe("asc");
  });

  it("setSort sets default direction for new field", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    // Switch to name: default asc
    await act(() => result.current.setSort("name"));
    expect(result.current.sort).toBe("name");
    expect(result.current.dir).toBe("asc");

    // Switch to dateAdded: default desc
    await act(() => result.current.setSort("dateAdded"));
    expect(result.current.sort).toBe("dateAdded");
    expect(result.current.dir).toBe("desc");
  });

  it("filteredAndSorted reflects filter state", async () => {
    const { result } = renderHook(() => useGalleryFilters(cards), {
      wrapper: withNuqsTestingAdapter({ hasMemory: true }),
    });

    await act(() => result.current.toggleStatus("FINISHED"));

    expect(result.current.filteredCount).toBe(1);
    expect(result.current.filteredAndSorted[0].name).toBe("Gamma");
  });
});
