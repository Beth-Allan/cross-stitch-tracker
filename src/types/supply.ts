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
};

export type ThreadWithBrand = Thread & { brand: SupplyBrand };
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

export const SUPPLY_TYPES: SupplyType[] = ["THREAD", "BEAD", "SPECIALTY"];
