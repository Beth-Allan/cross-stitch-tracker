import type { Fabric, FabricBrand } from "@/generated/prisma/client";

export type { Fabric, FabricBrand };

export type FabricWithBrand = Fabric & { brand: FabricBrand };

export type FabricBrandWithCounts = FabricBrand & { _count: { fabrics: number } };

export type FabricWithProject = Fabric & {
  brand: FabricBrand;
  linkedProject: {
    id: string;
    chart: { name: string; stitchesWide: number; stitchesHigh: number };
  } | null;
};

export const FABRIC_COUNTS = [14, 16, 18, 20, 22, 25, 28, 32, 36, 40] as const;

export const FABRIC_TYPES = [
  "Aida",
  "Linen",
  "Lugana",
  "Jobelan",
  "Evenweave",
  "Hardanger",
  "Congress Cloth",
  "Other",
] as const;

export const FABRIC_COLOR_FAMILIES = [
  "White",
  "Cream",
  "Blue",
  "Green",
  "Pink",
  "Purple",
  "Red",
  "Yellow",
  "Brown",
  "Gray",
  "Black",
  "Multi",
] as const;

export const FABRIC_COLOR_TYPES = [
  "White",
  "Cream",
  "Natural",
  "Neutrals",
  "Brights",
  "Pastels",
  "Dark",
  "Hand-dyed",
  "Overdyed",
] as const;
