import type { ProjectStatus } from "@/generated/prisma/client";
import type { SizeCategory } from "@/lib/utils/size-category";

// Re-export for convenience
export type { ProjectStatus } from "@/generated/prisma/client";
export type { SizeCategory } from "@/lib/utils/size-category";

// ─── Status Groups ─────────────────────────────────────────────────────────

export type StatusGroup = "wip" | "unstarted" | "finished";

// ─── Kitting ────────────────────────────────────────────────────────────────

export type KittingItemStatus = "fulfilled" | "partial" | "needed" | "not-applicable";

// ─── View Modes ─────────────────────────────────────────────────────────────

export const VIEW_MODES = ["gallery", "list", "table"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// ─── Sort ───────────────────────────────────────────────────────────────────

export const SORT_FIELDS = [
  "dateAdded",
  "name",
  "designer",
  "status",
  "size",
  "stitchCount",
  "progress",
] as const;
export type SortField = (typeof SORT_FIELDS)[number];

export const SORT_DIRS = ["asc", "desc"] as const;
export type SortDir = (typeof SORT_DIRS)[number];

// ─── Gallery Card Data ──────────────────────────────────────────────────────

export interface GalleryCardData {
  chartId: string;
  projectId: string | null;
  name: string;
  designerName: string;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  statusGroup: StatusGroup;
  genres: string[];
  sizeCategory: SizeCategory;
  stitchCount: number;
  stitchCountApproximate: boolean;
  stitchesCompleted: number;
  progressPercent: number;
  fabricStatus: KittingItemStatus;
  threadStatus: KittingItemStatus;
  beadsStatus: KittingItemStatus;
  specialtyStatus: KittingItemStatus;
  threadColourCount: number;
  beadTypeCount: number;
  specialtyItemCount: number;
  finishDate: Date | null;
  ffoDate: Date | null;
  dateAdded: Date;
}
