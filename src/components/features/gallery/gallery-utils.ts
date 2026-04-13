import type { ProjectStatus } from "@/generated/prisma/client";
import type { SizeCategory } from "@/lib/utils/size-category";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import type {
  GalleryCardData,
  GalleryChartWithProject,
  KittingItemStatus,
  StatusGroup,
  SortField,
  SortDir,
} from "./gallery-types";

// ─── Status Group Mapping ───────────────────────────────────────────────────

export function getStatusGroup(status: ProjectStatus): StatusGroup {
  switch (status) {
    case "IN_PROGRESS":
    case "ON_HOLD":
      return "wip";
    case "UNSTARTED":
    case "KITTING":
    case "KITTED":
      return "unstarted";
    case "FINISHED":
    case "FFO":
      return "finished";
  }
}

// ─── Kitting Dot Computation ────────────────────────────────────────────────

type SupplyItem = { quantityRequired: number; quantityAcquired: number };

function computeSupplyStatus(items: SupplyItem[]): KittingItemStatus {
  if (items.length === 0) return "not-applicable";
  const allAcquired = items.every((i) => i.quantityAcquired >= i.quantityRequired);
  if (allAcquired) return "fulfilled";
  return "partial";
}

export function computeKittingDots(project: {
  fabric: { id: string } | null;
  projectThreads: SupplyItem[];
  projectBeads: SupplyItem[];
  projectSpecialty: SupplyItem[];
}): {
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;
} {
  return {
    fabricStatus: project.fabric ? "fulfilled" : "needed",
    threadStatus: computeSupplyStatus(project.projectThreads),
    beadsStatus: computeSupplyStatus(project.projectBeads),
    specialtyStatus: computeSupplyStatus(project.projectSpecialty),
  };
}

// ─── Data Transformation ────────────────────────────────────────────────────

export function transformToGalleryCard(
  chart: GalleryChartWithProject,
  imageUrls: Record<string, string>,
): GalleryCardData {
  const status: ProjectStatus = chart.project?.status ?? "UNSTARTED";
  const statusGroup = getStatusGroup(status);

  const { count: stitchCount, approximate: stitchCountApproximate } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );
  const sizeCategory = calculateSizeCategory(stitchCount);

  const stitchesCompleted = chart.project?.stitchesCompleted ?? 0;
  const progressPercent = stitchCount > 0 ? Math.round((stitchesCompleted / stitchCount) * 100) : 0;

  // Kitting dots — default to not-applicable when no project (no supplies linked)
  let fabricStatus: KittingItemStatus = "needed";
  let threadStatus: KittingItemStatus = "not-applicable";
  let beadsStatus: KittingItemStatus = "not-applicable";
  let specialtyStatus: KittingItemStatus = "not-applicable";

  if (chart.project) {
    const dots = computeKittingDots({
      fabric: chart.project.fabric ? { id: chart.project.fabric.id } : null,
      projectThreads: chart.project.projectThreads,
      projectBeads: chart.project.projectBeads,
      projectSpecialty: chart.project.projectSpecialty,
    });
    fabricStatus = dots.fabricStatus;
    threadStatus = dots.threadStatus;
    beadsStatus = dots.beadsStatus;
    specialtyStatus = dots.specialtyStatus;
  }

  return {
    chartId: chart.id,
    projectId: chart.project?.id ?? null,
    name: chart.name,
    designerName: chart.designer?.name ?? "Unknown",
    coverImageUrl: chart.coverImageUrl ? (imageUrls[chart.coverImageUrl] ?? null) : null,
    coverThumbnailUrl: chart.coverThumbnailUrl
      ? (imageUrls[chart.coverThumbnailUrl] ?? null)
      : null,
    status,
    statusGroup,
    genres: chart.genres.map((g) => g.name),
    sizeCategory,
    stitchCount,
    stitchCountApproximate,
    stitchesCompleted,
    progressPercent,
    fabricStatus,
    threadStatus,
    beadsStatus,
    specialtyStatus,
    threadColourCount: chart.project?.projectThreads.length ?? 0,
    beadTypeCount: chart.project?.projectBeads.length ?? 0,
    specialtyItemCount: chart.project?.projectSpecialty.length ?? 0,
    finishDate: chart.project?.finishDate ?? null,
    ffoDate: chart.project?.ffoDate ?? null,
    dateAdded: chart.dateAdded,
  };
}

// ─── Status Gradients ───────────────────────────────────────────────────────

export const STATUS_GRADIENTS: Record<ProjectStatus, [string, string]> = {
  UNSTARTED: ["#e7e5e4", "#d6d3d1"],
  KITTING: ["#fef3c7", "#fde68a"],
  KITTED: ["#d1fae5", "#a7f3d0"],
  IN_PROGRESS: ["#e0f2fe", "#bae6fd"],
  ON_HOLD: ["#ffedd5", "#fed7aa"],
  FINISHED: ["#ede9fe", "#ddd6fe"],
  FFO: ["#ffe4e6", "#fecdd3"],
};

// ─── Celebration Styles ─────────────────────────────────────────────────────

export function getCelebrationStyles(
  status: ProjectStatus,
): { border: string; boxShadow: string } | null {
  if (status === "FINISHED") {
    return {
      border: "2px solid rgb(139 92 246)",
      boxShadow: "0 0 0 1px rgb(139 92 246 / 0.15), 0 0 12px rgb(139 92 246 / 0.08)",
    };
  }
  if (status === "FFO") {
    return {
      border: "2px solid rgb(244 63 94)",
      boxShadow: "0 0 0 1px rgb(244 63 94 / 0.15), 0 0 12px rgb(244 63 94 / 0.08)",
    };
  }
  return null;
}

// ─── Sort Order Constants ───────────────────────────────────────────────────

export const STATUS_SORT_ORDER: Record<ProjectStatus, number> = {
  UNSTARTED: 0,
  KITTING: 1,
  KITTED: 2,
  IN_PROGRESS: 3,
  ON_HOLD: 4,
  FINISHED: 5,
  FFO: 6,
};

export const SIZE_SORT_ORDER: Record<SizeCategory, number> = {
  Mini: 0,
  Small: 1,
  Medium: 2,
  Large: 3,
  BAP: 4,
};

// ─── Sort Comparator ────────────────────────────────────────────────────────

export function compareFn(
  field: SortField,
  dir: SortDir,
): (a: GalleryCardData, b: GalleryCardData) => number {
  const multiplier = dir === "desc" ? -1 : 1;

  return (a: GalleryCardData, b: GalleryCardData): number => {
    let result: number;

    switch (field) {
      case "name":
        result = a.name.localeCompare(b.name);
        break;
      case "designer": {
        // "Unknown" sorts last in ascending
        const aIsUnknown = a.designerName === "Unknown" || a.designerName === "";
        const bIsUnknown = b.designerName === "Unknown" || b.designerName === "";
        if (aIsUnknown && !bIsUnknown) result = 1;
        else if (!aIsUnknown && bIsUnknown) result = -1;
        else result = a.designerName.localeCompare(b.designerName);
        break;
      }
      case "status":
        result = STATUS_SORT_ORDER[a.status] - STATUS_SORT_ORDER[b.status];
        break;
      case "size":
        result = SIZE_SORT_ORDER[a.sizeCategory] - SIZE_SORT_ORDER[b.sizeCategory];
        break;
      case "stitchCount":
        result = a.stitchCount - b.stitchCount;
        break;
      case "dateAdded":
        result = a.dateAdded.getTime() - b.dateAdded.getTime();
        break;
      default:
        result = 0;
    }

    return result * multiplier;
  };
}

// ─── Filter & Sort (pure function for testability) ──────────────────────────

export function filterAndSort(
  cards: GalleryCardData[],
  options: {
    search: string;
    statusFilter: string[];
    sizeFilter: string[];
    sort: SortField;
    dir: SortDir;
  },
): GalleryCardData[] {
  let result = cards;

  // Search filter (case-insensitive name match)
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter((c) => c.name.toLowerCase().includes(q));
  }

  // Status filter
  if (options.statusFilter.length > 0) {
    result = result.filter((c) => options.statusFilter.includes(c.status));
  }

  // Size filter
  if (options.sizeFilter.length > 0) {
    result = result.filter((c) => options.sizeFilter.includes(c.sizeCategory));
  }

  // Sort
  return [...result].sort(compareFn(options.sort, options.dir));
}
