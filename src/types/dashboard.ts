import type { ProjectStatus } from "@/generated/prisma/client";

// ─── Shopping Cart Types ────────────────────────────────────────────────────

export interface ShoppingCartProject {
  projectId: string;
  chartId: string;
  projectName: string;
  designerName: string | null;
  coverThumbnailUrl: string | null;
  status: ProjectStatus;
  threadCount: number;
  beadCount: number;
  specialtyCount: number;
  fabricNeeded: boolean;
}

export interface ShoppingSupplyNeed {
  junctionId: string;
  supplyId: string;
  brandName: string;
  code: string;
  colorName: string;
  hexColor: string | null;
  quantityRequired: number;
  quantityAcquired: number;
  unit: string;
  projectId: string;
  projectName: string;
}

export interface ShoppingFabricNeed {
  projectId: string;
  projectName: string;
  stitchesWide: number;
  stitchesHigh: number;
  hasFabric: boolean;
  fabricName: string | null;
}

export interface ShoppingCartData {
  projects: ShoppingCartProject[];
  threads: ShoppingSupplyNeed[];
  beads: ShoppingSupplyNeed[];
  specialty: ShoppingSupplyNeed[];
  fabrics: ShoppingFabricNeed[];
}
