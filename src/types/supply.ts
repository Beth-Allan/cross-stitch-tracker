import type {
  SupplyBrand,
  Thread,
  Bead,
  SpecialtyItem,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  ColorFamily,
  SupplyType,
  ThreadLine,
  StrandStructure,
} from "@/generated/prisma/client";

export type {
  SupplyBrand,
  Thread,
  Bead,
  SpecialtyItem,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  ColorFamily,
  SupplyType,
  ThreadLine,
  StrandStructure,
};

/**
 * What the skein calculator reads from a thread's line. Any field null is unknown, and an
 * unknown line has no calculated need (THR-011, Q-009).
 */
export type SkeinLine = Pick<ThreadLine, "skeinLengthMm" | "strandStructure" | "cutLengthInches">;

export type ThreadWithBrand = Thread & { brand: SupplyBrand; line: ThreadLine };
export type BeadWithBrand = Bead & { brand: SupplyBrand };
export type SpecialtyItemWithBrand = SpecialtyItem & { brand: SupplyBrand };

export type SupplyBrandWithCounts = SupplyBrand & {
  _count: { threads: number; beads: number; specialtyItems: number };
};

export type ProjectThreadWithThread = ProjectThread & { thread: ThreadWithBrand };
export type ProjectBeadWithBead = ProjectBead & { bead: BeadWithBrand };
export type ProjectSpecialtyWithItem = ProjectSpecialty & {
  specialtyItem: SpecialtyItemWithBrand;
};

/** Valid strand counts for cross-stitch (1-6 strands of floss). */
export type StrandCount = 1 | 2 | 3 | 4 | 5 | 6;

/** Type guard that validates a number is a valid StrandCount (integer 1-6). */
export function isStrandCount(value: number): value is StrandCount {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

export const COLOR_FAMILIES: ColorFamily[] = [
  "BLACK",
  "WHITE",
  "RED",
  "ORANGE",
  "YELLOW",
  "GREEN",
  "BLUE",
  "PURPLE",
  "BROWN",
  "GRAY",
  "NEUTRAL",
];

/** Human-readable labels for the colour families, shared by every picker and filter. */
export const COLOR_FAMILY_LABELS: Record<ColorFamily, string> = {
  BLACK: "Black",
  WHITE: "White",
  RED: "Red",
  ORANGE: "Orange",
  YELLOW: "Yellow",
  GREEN: "Green",
  BLUE: "Blue",
  PURPLE: "Purple",
  BROWN: "Brown",
  GRAY: "Gray",
  NEUTRAL: "Neutral",
};

export const SUPPLY_TYPES: SupplyType[] = ["THREAD", "BEAD", "SPECIALTY"];
