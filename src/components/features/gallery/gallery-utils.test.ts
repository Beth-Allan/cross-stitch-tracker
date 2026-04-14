import { describe, it, expect } from "vitest";
import {
  getStatusGroup,
  computeKittingDots,
  transformToGalleryCard,
  compareFn,
  STATUS_GRADIENT_CLASSES,
  getCelebrationClasses,
  STATUS_SORT_ORDER,
  SIZE_SORT_ORDER,
} from "./gallery-utils";
import type { GalleryChartData } from "@/types/chart";
import { createMockGalleryCard } from "@/__tests__/mocks/factories";

// ─── getStatusGroup ─────────────────────────────────────────────────────────

describe("getStatusGroup", () => {
  it("maps IN_PROGRESS to wip", () => {
    expect(getStatusGroup("IN_PROGRESS")).toBe("wip");
  });

  it("maps ON_HOLD to wip", () => {
    expect(getStatusGroup("ON_HOLD")).toBe("wip");
  });

  it("maps UNSTARTED to unstarted", () => {
    expect(getStatusGroup("UNSTARTED")).toBe("unstarted");
  });

  it("maps KITTING to unstarted", () => {
    expect(getStatusGroup("KITTING")).toBe("unstarted");
  });

  it("maps KITTED to unstarted", () => {
    expect(getStatusGroup("KITTED")).toBe("unstarted");
  });

  it("maps FINISHED to finished", () => {
    expect(getStatusGroup("FINISHED")).toBe("finished");
  });

  it("maps FFO to finished", () => {
    expect(getStatusGroup("FFO")).toBe("finished");
  });
});

// ─── computeKittingDots ─────────────────────────────────────────────────────

describe("computeKittingDots", () => {
  const noSupplies = { projectThreads: [], projectBeads: [], projectSpecialty: [] };
  const acquired = { quantityRequired: 1, quantityAcquired: 1 };
  const unacquired = { quantityRequired: 1, quantityAcquired: 0 };

  it("returns fulfilled for fabric when project has fabric", () => {
    const result = computeKittingDots({
      fabric: { id: "f1" },
      ...noSupplies,
    });
    expect(result.fabricStatus).toBe("fulfilled");
  });

  it("returns needed for fabric when project has no fabric", () => {
    const result = computeKittingDots({
      fabric: null,
      ...noSupplies,
    });
    expect(result.fabricStatus).toBe("needed");
  });

  it("returns not-applicable for threads when none linked", () => {
    const result = computeKittingDots({
      fabric: null,
      ...noSupplies,
    });
    expect(result.threadStatus).toBe("not-applicable");
  });

  it("returns partial for threads when some are not acquired", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [acquired, unacquired, acquired],
      projectBeads: [],
      projectSpecialty: [],
    });
    expect(result.threadStatus).toBe("partial");
  });

  it("returns fulfilled for threads when all are acquired", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [acquired, acquired, acquired],
      projectBeads: [],
      projectSpecialty: [],
    });
    expect(result.threadStatus).toBe("fulfilled");
  });

  it("returns needed for threads when none are acquired yet", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [unacquired, unacquired],
      projectBeads: [],
      projectSpecialty: [],
    });
    expect(result.threadStatus).toBe("needed");
  });

  it("returns not-applicable for beads when none linked", () => {
    const result = computeKittingDots({
      fabric: null,
      ...noSupplies,
    });
    expect(result.beadsStatus).toBe("not-applicable");
  });

  it("returns fulfilled for beads when all acquired", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [],
      projectBeads: [acquired, acquired],
      projectSpecialty: [],
    });
    expect(result.beadsStatus).toBe("fulfilled");
  });

  it("returns partial for beads when some not acquired", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [],
      projectBeads: [acquired, unacquired],
      projectSpecialty: [],
    });
    expect(result.beadsStatus).toBe("partial");
  });

  it("returns not-applicable for specialty when none linked", () => {
    const result = computeKittingDots({
      fabric: null,
      ...noSupplies,
    });
    expect(result.specialtyStatus).toBe("not-applicable");
  });

  it("returns fulfilled for specialty when all acquired", () => {
    const result = computeKittingDots({
      fabric: null,
      projectThreads: [],
      projectBeads: [],
      projectSpecialty: [acquired],
    });
    expect(result.specialtyStatus).toBe("fulfilled");
  });
});

// ─── transformToGalleryCard ─────────────────────────────────────────────────

describe("transformToGalleryCard", () => {
  const baseChart: GalleryChartData = {
    id: "chart-1",
    name: "My Cross Stitch",
    designerId: "d1",
    coverImageUrl: "covers/img.jpg",
    coverThumbnailUrl: "covers/thumb.jpg",
    stitchCount: 10000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 100,
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    digitalWorkingCopyUrl: null,
    dateAdded: new Date("2026-01-15"),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    designer: {
      id: "d1",
      name: "Jane Doe",
      website: null,
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    genres: [
      { id: "g1", name: "Sampler", createdAt: new Date(), updatedAt: new Date() },
      { id: "g2", name: "Floral", createdAt: new Date(), updatedAt: new Date() },
    ],
    project: {
      id: "proj-1",
      status: "IN_PROGRESS",
      stitchesCompleted: 2500,
      startDate: new Date("2026-02-01"),
      finishDate: null,
      ffoDate: null,
      fabric: { id: "f1" },
      projectThreads: Array.from({ length: 12 }, () => ({
        quantityRequired: 1,
        quantityAcquired: 1,
      })),
      projectBeads: [],
      projectSpecialty: [{ quantityRequired: 1, quantityAcquired: 1 }],
    },
  };

  const imageUrls: Record<string, string> = {
    "covers/img.jpg": "https://r2.example.com/covers/img.jpg?signed",
    "covers/thumb.jpg": "https://r2.example.com/covers/thumb.jpg?signed",
  };

  it("maps all fields correctly", () => {
    const card = transformToGalleryCard(baseChart, imageUrls);

    expect(card.chartId).toBe("chart-1");
    expect(card.projectId).toBe("proj-1");
    expect(card.name).toBe("My Cross Stitch");
    expect(card.designerName).toBe("Jane Doe");
    expect(card.coverImageUrl).toBe("https://r2.example.com/covers/img.jpg?signed");
    expect(card.coverThumbnailUrl).toBe("https://r2.example.com/covers/thumb.jpg?signed");
    expect(card.status).toBe("IN_PROGRESS");
    expect(card.statusGroup).toBe("wip");
    expect(card.genres).toEqual(["Sampler", "Floral"]);
    expect(card.sizeCategory).toBe("Medium");
    expect(card.stitchCount).toBe(10000);
    expect(card.stitchCountApproximate).toBe(false);
    expect(card.dateAdded).toEqual(new Date("2026-01-15"));
  });

  it("computes progressPercent correctly", () => {
    const card = transformToGalleryCard(baseChart, imageUrls);
    expect(card.progressPercent).toBe(25); // 2500/10000 = 25%
  });

  it("computes kitting dots from project data", () => {
    const card = transformToGalleryCard(baseChart, imageUrls);
    expect(card.fabricStatus).toBe("fulfilled");
    expect(card.threadStatus).toBe("fulfilled");
    // IN_PROGRESS with 0 beads = not-applicable
    expect(card.beadsStatus).toBe("not-applicable");
    expect(card.specialtyStatus).toBe("fulfilled");
  });

  it("maps supply counts from project supply arrays", () => {
    const card = transformToGalleryCard(baseChart, imageUrls);
    expect(card.threadColourCount).toBe(12);
    expect(card.beadTypeCount).toBe(0);
    expect(card.specialtyItemCount).toBe(1);
  });

  it("handles chart with no project (defaults to UNSTARTED)", () => {
    const chartNoProject: GalleryChartData = {
      ...baseChart,
      project: null,
      designer: null,
    };
    const card = transformToGalleryCard(chartNoProject, imageUrls);

    expect(card.status).toBe("UNSTARTED");
    expect(card.statusGroup).toBe("unstarted");
    expect(card.designerName).toBe("Unknown");
    expect(card.stitchesCompleted).toBe(0);
    expect(card.progressPercent).toBe(0);
    expect(card.fabricStatus).toBe("needed");
    expect(card.threadStatus).toBe("not-applicable");
    expect(card.beadsStatus).toBe("not-applicable");
    expect(card.specialtyStatus).toBe("not-applicable");
    expect(card.threadColourCount).toBe(0);
    expect(card.beadTypeCount).toBe(0);
    expect(card.specialtyItemCount).toBe(0);
  });

  it("handles missing cover image URLs gracefully", () => {
    const chartNoCover: GalleryChartData = {
      ...baseChart,
      coverImageUrl: null,
      coverThumbnailUrl: null,
    };
    const card = transformToGalleryCard(chartNoCover, imageUrls);
    expect(card.coverImageUrl).toBeNull();
    expect(card.coverThumbnailUrl).toBeNull();
  });

  it("computes stitch count from dimensions when stitchCount is 0", () => {
    const chartDimensions: GalleryChartData = {
      ...baseChart,
      stitchCount: 0,
      stitchesWide: 200,
      stitchesHigh: 300,
    };
    const card = transformToGalleryCard(chartDimensions, imageUrls);
    expect(card.stitchCount).toBe(60000); // 200*300
    expect(card.stitchCountApproximate).toBe(true);
    expect(card.sizeCategory).toBe("BAP"); // 60k > 50k
  });

  it("returns 0 progressPercent when stitchCount is 0", () => {
    const chartZero: GalleryChartData = {
      ...baseChart,
      stitchCount: 0,
      stitchesWide: 0,
      stitchesHigh: 0,
    };
    const card = transformToGalleryCard(chartZero, imageUrls);
    expect(card.progressPercent).toBe(0);
  });
});

// ─── compareFn ──────────────────────────────────────────────────────────────

describe("compareFn", () => {
  it("sorts by name ascending (A-Z)", () => {
    const a = createMockGalleryCard({ name: "Alpha" });
    const b = createMockGalleryCard({ name: "Beta" });
    const sorter = compareFn("name", "asc");
    expect(sorter(a, b)).toBeLessThan(0);
  });

  it("sorts by name descending (Z-A)", () => {
    const a = createMockGalleryCard({ name: "Alpha" });
    const b = createMockGalleryCard({ name: "Beta" });
    const sorter = compareFn("name", "desc");
    expect(sorter(a, b)).toBeGreaterThan(0);
  });

  it("sorts by dateAdded descending (newest first)", () => {
    const older = createMockGalleryCard({ dateAdded: new Date("2026-01-01") });
    const newer = createMockGalleryCard({ dateAdded: new Date("2026-03-01") });
    const sorter = compareFn("dateAdded", "desc");
    expect(sorter(newer, older)).toBeLessThan(0); // newer comes first
  });

  it("sorts by designer ascending, null designers last", () => {
    const known = createMockGalleryCard({ designerName: "Alice" });
    const unknown = createMockGalleryCard({ designerName: "Unknown" });
    const sorter = compareFn("designer", "asc");
    expect(sorter(known, unknown)).toBeLessThan(0);
  });

  it("sorts by status ascending (UNSTARTED < KITTING < ... < FFO)", () => {
    const unstarted = createMockGalleryCard({ status: "UNSTARTED" });
    const ffo = createMockGalleryCard({ status: "FFO" });
    const sorter = compareFn("status", "asc");
    expect(sorter(unstarted, ffo)).toBeLessThan(0);
  });

  it("sorts by stitchCount descending (largest first)", () => {
    const small = createMockGalleryCard({ stitchCount: 1000 });
    const large = createMockGalleryCard({ stitchCount: 50000 });
    const sorter = compareFn("stitchCount", "desc");
    expect(sorter(large, small)).toBeLessThan(0);
  });

  it("sorts by size descending (BAP > Large > Medium > Small > Mini)", () => {
    const mini = createMockGalleryCard({ sizeCategory: "Mini" });
    const bap = createMockGalleryCard({ sizeCategory: "BAP" });
    const sorter = compareFn("size", "desc");
    expect(sorter(bap, mini)).toBeLessThan(0);
  });

  it("sorts by size ascending (Mini < Small < Medium < Large < BAP)", () => {
    const mini = createMockGalleryCard({ sizeCategory: "Mini" });
    const large = createMockGalleryCard({ sizeCategory: "Large" });
    const sorter = compareFn("size", "asc");
    expect(sorter(mini, large)).toBeLessThan(0);
  });
});

// ─── getCelebrationClasses ──────────────────────────────────────────────────

describe("getCelebrationClasses", () => {
  it("returns violet classes for FINISHED", () => {
    const classes = getCelebrationClasses("FINISHED");
    expect(classes).not.toBeNull();
    expect(classes).toContain("border-violet-500");
  });

  it("returns rose classes for FFO", () => {
    const classes = getCelebrationClasses("FFO");
    expect(classes).not.toBeNull();
    expect(classes).toContain("border-rose-500");
  });

  it("returns null for IN_PROGRESS", () => {
    expect(getCelebrationClasses("IN_PROGRESS")).toBeNull();
  });

  it("returns null for UNSTARTED", () => {
    expect(getCelebrationClasses("UNSTARTED")).toBeNull();
  });
});

// ─── STATUS_GRADIENT_CLASSES ────────────────────────────────────────────────

describe("STATUS_GRADIENT_CLASSES", () => {
  it("has 7 entries, one per ProjectStatus", () => {
    expect(Object.keys(STATUS_GRADIENT_CLASSES)).toHaveLength(7);
  });

  it("has Tailwind gradient classes for all ProjectStatus values", () => {
    const statuses = [
      "UNSTARTED",
      "KITTING",
      "KITTED",
      "IN_PROGRESS",
      "ON_HOLD",
      "FINISHED",
      "FFO",
    ];
    for (const status of statuses) {
      expect(STATUS_GRADIENT_CLASSES).toHaveProperty(status);
      const classes = STATUS_GRADIENT_CLASSES[status as keyof typeof STATUS_GRADIENT_CLASSES];
      expect(classes).toContain("bg-gradient-to-br");
      expect(classes).toContain("dark:");
    }
  });
});

// ─── Sort Order Constants ───────────────────────────────────────────────────

describe("STATUS_SORT_ORDER", () => {
  it("orders UNSTARTED before FFO", () => {
    expect(STATUS_SORT_ORDER.UNSTARTED).toBeLessThan(STATUS_SORT_ORDER.FFO);
  });

  it("has 7 entries", () => {
    expect(Object.keys(STATUS_SORT_ORDER)).toHaveLength(7);
  });
});

describe("SIZE_SORT_ORDER", () => {
  it("orders Mini before BAP", () => {
    expect(SIZE_SORT_ORDER.Mini).toBeLessThan(SIZE_SORT_ORDER.BAP);
  });

  it("has 5 entries", () => {
    expect(Object.keys(SIZE_SORT_ORDER)).toHaveLength(5);
  });
});
