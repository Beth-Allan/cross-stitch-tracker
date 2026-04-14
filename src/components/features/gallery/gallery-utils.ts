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

// ─── Status Gradient Classes (dark-mode aware) ─────────────────────────────

export const STATUS_GRADIENT_CLASSES: Record<ProjectStatus, string> = {
  UNSTARTED: "bg-gradient-to-br from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700",
  KITTING: "bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900 dark:to-amber-800",
  KITTED:
    "bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800",
  IN_PROGRESS: "bg-gradient-to-br from-sky-100 to-sky-200 dark:from-sky-900 dark:to-sky-800",
  ON_HOLD:
    "bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900 dark:to-orange-800",
  FINISHED:
    "bg-gradient-to-br from-violet-100 to-violet-200 dark:from-violet-900 dark:to-violet-800",
  FFO: "bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800",
};

// ─── Celebration Classes (dark-mode aware) ──────────────────────────────────

export function getCelebrationClasses(status: ProjectStatus): string | null {
  if (status === "FINISHED") {
    return "border-2 border-violet-500 shadow-[0_0_0_1px_rgb(139_92_246/0.15),0_0_12px_rgb(139_92_246/0.08)] dark:shadow-[0_0_0_1px_rgb(139_92_246/0.25),0_0_12px_rgb(139_92_246/0.2)]";
  }
  if (status === "FFO") {
    return "border-2 border-rose-500 shadow-[0_0_0_1px_rgb(244_63_94/0.15),0_0_12px_rgb(244_63_94/0.08)] dark:shadow-[0_0_0_1px_rgb(244_63_94/0.25),0_0_12px_rgb(244_63_94/0.2)]";
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
      case "progress":
        result = a.progressPercent - b.progressPercent;
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

  // Search filter (case-insensitive name + designer match)
  if (options.search) {
    const q = options.search.toLowerCase();
    result = result.filter(
      (c) => c.name.toLowerCase().includes(q) || c.designerName.toLowerCase().includes(q),
    );
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
