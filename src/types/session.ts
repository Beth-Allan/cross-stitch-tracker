import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Session Row (for table display) ────────────────────────────────────────

export interface StitchSessionRow {
  id: string;
  projectId: string;
  projectName: string; // From chart.name via project relation
  date: Date;
  stitchCount: number;
  timeSpentMinutes: number | null;
  photoKey: string | null;
  createdAt: Date;
}

// ─── Session Form Data ──────────────────────────────────────────────────────

export interface SessionFormData {
  projectId: string;
  date: string; // ISO date string
  stitchCount: number;
  timeSpentMinutes: number | null;
  photoKey: string | null;
}

// ─── Active Project for Picker ──────────────────────────────────────────────

export interface ActiveProjectForPicker {
  projectId: string;
  chartId: string;
  chartName: string;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  stitchesCompleted: number;
  totalStitches: number; // From chart.stitchCount
}

// ─── Project Session Stats (mini-stat cards) ────────────────────────────────

export interface ProjectSessionStats {
  totalStitches: number; // Sum of all session stitchCounts
  sessionsLogged: number; // Count of sessions
  avgPerSession: number; // totalStitches / sessionsLogged (0 if no sessions)
  activeSince: Date | null; // Earliest session date (null if no sessions)
}

// ─── Pattern Dive Types ─────────────────────────────────────────────────────

export interface WhatsNextProject {
  chartId: string;
  chartName: string;
  coverThumbnailUrl: string | null;
  designerName: string | null;
  status: ProjectStatus;
  wantToStartNext: boolean;
  kittingPercent: number; // 0-100
  dateAdded: Date;
  totalStitches: number;
}

export interface FabricRequirementRow {
  chartId: string;
  projectId: string;
  chartName: string;
  coverThumbnailUrl: string | null;
  designerName: string | null;
  stitchesWide: number;
  stitchesHigh: number;
  totalStitches: number;
  fabricCount: number | null; // From linked fabric, null if no fabric
  fabricName: string | null;
  fabricId: string | null;
  requiredWidth: number | null; // Calculated with 3" margin formula
  requiredHeight: number | null;
  assignedFabric: {
    id: string;
    name: string;
    brandName: string;
    count: number;
    shortestEdgeInches: number;
    longestEdgeInches: number;
  } | null;
  matchingFabrics: {
    id: string;
    name: string;
    brandName: string;
    count: number;
    shortestEdgeInches: number;
    longestEdgeInches: number;
    fitsWidth: boolean;
    fitsHeight: boolean;
  }[];
}

export interface StorageGroup {
  locationId: string | null; // null for "No Location" group
  locationName: string;
  items: StorageGroupItem[];
}

export interface StorageGroupItem {
  type: "project" | "fabric";
  id: string; // chartId for projects, fabricId for fabrics
  name: string;
  coverThumbnailUrl: string | null;
  status?: ProjectStatus; // Only for projects
  fabricCount?: number; // Only for fabrics
  brandName?: string; // Only for fabrics
}
