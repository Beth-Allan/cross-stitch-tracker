import type { ProjectStatus } from "@/generated/prisma/client";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
  StrandCount,
} from "@/types/supply";

// ─── Tab Navigation ────────────────────────────────────────────────────────

export const TAB_VALUES = ["overview", "supplies", "sessions"] as const;
export type TabValue = (typeof TAB_VALUES)[number];

// ─── Supply Sorting ────────────────────────────────────────────────────────

export const SUPPLY_SORT_OPTIONS = ["added", "alpha"] as const;
export type SupplySortOption = (typeof SUPPLY_SORT_OPTIONS)[number];

// ─── Calculator Settings ───────────────────────────────────────────────────

export interface CalculatorSettings {
  strandCount: StrandCount;
  overCount: 1 | 2;
  fabricCount: number; // from linked fabric or default 14
  wastePercent: number; // 0-50
}

// ─── Project Detail Props ──────────────────────────────────────────────────

export interface ProjectDetailProps {
  chart: {
    id: string;
    name: string;
    stitchCount: number | null;
    stitchesWide: number | null;
    stitchesHigh: number | null;
    coverImageUrl: string | null;
    coverThumbnailUrl: string | null;
    files: Array<{
      id: string;
      url: string;
      filename: string;
      mimeType: string;
      fileSize: number;
      label: string | null;
      notes: string | null;
      createdAt: Date;
    }>;
    notes: string | null;
    dateAdded: Date;
    designer: { id: string; name: string } | null;
    genres: { id: string; name: string }[];
    project: {
      id: string;
      userId: string;
      status: ProjectStatus;
      startDate: Date | null;
      finishDate: Date | null;
      ffoDate: Date | null;
      startingStitches: number;
      stitchesCompleted: number;
      strandCount: number;
      overCount: 1 | 2;
      wastePercent: number;
      storageLocation: { id: string; name: string } | null;
      stitchingApp: { id: string; name: string } | null;
      fabric: { id: string; name: string; count: number; brand: { name: string } } | null;
    } | null;
  };
  supplies: {
    threads: ProjectThreadWithThread[];
    beads: ProjectBeadWithBead[];
    specialty: ProjectSpecialtyWithItem[];
  } | null;
}

// ─── Overview Tab Section Ordering ──────────────────────────────────────────

export type OverviewSection =
  | "kitting"
  | "progress"
  | "completion"
  | "patternDetails"
  | "dates"
  | "projectSetup";

export const SECTION_ORDER: Record<ProjectStatus, OverviewSection[]> = {
  UNSTARTED: ["kitting", "patternDetails", "dates", "projectSetup"],
  KITTING: ["kitting", "patternDetails", "dates", "projectSetup"],
  KITTED: ["patternDetails", "projectSetup", "dates"],
  IN_PROGRESS: ["progress", "patternDetails", "dates", "projectSetup"],
  ON_HOLD: ["progress", "patternDetails", "dates", "projectSetup"],
  FINISHED: ["completion", "patternDetails", "dates", "projectSetup"],
  FFO: ["completion", "patternDetails", "dates", "projectSetup"],
};
