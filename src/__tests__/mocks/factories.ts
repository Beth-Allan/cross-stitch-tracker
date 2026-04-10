import type {
  Chart,
  Project,
  Designer,
  Genre,
  SupplyBrand,
  Thread,
  Bead,
  SpecialtyItem,
  ProjectThread,
  ProjectBead,
  ProjectSpecialty,
  FabricBrand,
  Fabric,
} from "@/generated/prisma/client";
import type { DesignerWithStats, DesignerChart } from "@/types/designer";
import type { GenreWithStats, GenreChart } from "@/types/genre";
import { vi } from "vitest";

/**
 * Test data factories for domain objects.
 * Each factory returns a full typed object with sensible defaults.
 * Pass Partial<T> overrides to customize specific fields.
 */

export function createMockDesigner(overrides?: Partial<Designer>): Designer {
  return {
    id: "d1",
    name: "Test Designer",
    website: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockDesignerWithStats(
  overrides?: Partial<DesignerWithStats>,
): DesignerWithStats {
  return {
    id: "d1",
    name: "Test Designer",
    website: null,
    notes: null,
    chartCount: 0,
    ...overrides,
  };
}

export function createMockDesignerChart(overrides?: Partial<DesignerChart>): DesignerChart {
  return {
    id: "chart-1",
    name: "Test Chart",
    coverThumbnailUrl: null,
    stitchCount: 5000,
    stitchesWide: 100,
    stitchesHigh: 50,
    status: null,
    stitchesCompleted: 0,
    genres: [],
    ...overrides,
  };
}

export function createMockGenre(overrides?: Partial<Genre>): Genre {
  return {
    id: "g1",
    name: "Test Genre",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockGenreWithStats(overrides?: Partial<GenreWithStats>): GenreWithStats {
  return {
    id: "g1",
    name: "Test Genre",
    chartCount: 0,
    ...overrides,
  };
}

export function createMockGenreChart(overrides?: Partial<GenreChart>): GenreChart {
  return {
    id: "chart-1",
    name: "Test Chart",
    coverThumbnailUrl: null,
    stitchCount: 5000,
    stitchesWide: 100,
    stitchesHigh: 50,
    status: null,
    stitchesCompleted: 0,
    ...overrides,
  };
}

export function createMockProject(overrides?: Partial<Project>): Project {
  return {
    id: "proj-1",
    chartId: "chart-1",
    userId: "user-1",
    status: "UNSTARTED",
    startDate: null,
    finishDate: null,
    ffoDate: null,
    finishPhotoUrl: null,
    projectBin: null,
    ipadApp: null,
    needsOnionSkinning: false,
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
    stitchesCompleted: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockChart(overrides?: Partial<Chart>): Chart {
  return {
    id: "chart-1",
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    stitchCount: 5000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 50,
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    digitalWorkingCopyUrl: null,
    dateAdded: new Date(),
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

type ChartWithRelations = Chart & {
  project: Project | null;
  designer: Designer | null;
  genres: Genre[];
};

export function createMockChartWithRelations(
  overrides?: Partial<Chart> & {
    project?: Partial<Project> | null;
    designer?: Partial<Designer> | null;
    genres?: Genre[];
  },
): ChartWithRelations {
  const { project, designer, genres, ...chartOverrides } = overrides ?? {};
  const chart = createMockChart(chartOverrides);

  return {
    ...chart,
    project: project === null ? null : createMockProject({ chartId: chart.id, ...project }),
    designer: designer === undefined || designer === null ? null : createMockDesigner(designer),
    genres: genres ?? [],
  };
}

// ─── Supply Factories ───────────────────────────────────────────────────────

export function createMockSupplyBrand(overrides?: Partial<SupplyBrand>): SupplyBrand {
  return {
    id: "brand-1",
    name: "DMC",
    website: "https://www.dmc.com",
    supplyType: "THREAD",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockThread(overrides?: Partial<Thread>): Thread {
  return {
    id: "thread-1",
    brandId: "brand-1",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    colorFamily: "BLACK",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockBead(overrides?: Partial<Bead>): Bead {
  return {
    id: "bead-1",
    brandId: "brand-1",
    productCode: "00123",
    colorName: "Red",
    hexColor: "#FF0000",
    colorFamily: "RED",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockSpecialtyItem(overrides?: Partial<SpecialtyItem>): SpecialtyItem {
  return {
    id: "specialty-1",
    brandId: "brand-1",
    productCode: "K001",
    colorName: "Gold Braid",
    description: "Metallic braid",
    hexColor: "#FFD700",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockProjectThread(overrides?: Partial<ProjectThread>): ProjectThread {
  return {
    id: "pt-1",
    projectId: "proj-1",
    threadId: "thread-1",
    stitchCount: 0,
    quantityRequired: 1,
    quantityAcquired: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockProjectBead(overrides?: Partial<ProjectBead>): ProjectBead {
  return {
    id: "pb-1",
    projectId: "proj-1",
    beadId: "bead-1",
    quantityRequired: 1,
    quantityAcquired: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockProjectSpecialty(
  overrides?: Partial<ProjectSpecialty>,
): ProjectSpecialty {
  return {
    id: "ps-1",
    projectId: "proj-1",
    specialtyItemId: "specialty-1",
    quantityRequired: 1,
    quantityAcquired: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Fabric Factories ───────────────────────────────────────────────────────

export function createMockFabricBrand(overrides?: Partial<FabricBrand>): FabricBrand {
  return {
    id: "fb-1",
    name: "Zweigart",
    website: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

export function createMockFabric(overrides?: Partial<Fabric>): Fabric {
  return {
    id: "fabric-1",
    name: "White Aida 14ct",
    brandId: "fb-1",
    photoUrl: null,
    count: 14,
    type: "Aida",
    colorFamily: "White",
    colorType: "White",
    shortestEdgeInches: 18,
    longestEdgeInches: 24,
    needToBuy: false,
    linkedProjectId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ─── Mock Prisma Client ─────────────────────────────────────────────────────

/**
 * Creates a mock Prisma client object for use inside vi.mock("@/lib/db") factories.
 * Returns an object matching the prisma client shape used in server actions.
 */
export function createMockPrisma() {
  return {
    chart: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
    },
    project: { findUnique: vi.fn(), update: vi.fn() },
    designer: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    genre: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    supplyBrand: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    thread: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    bead: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    specialtyItem: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    projectThread: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    projectBead: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    projectSpecialty: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    fabricBrand: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    fabric: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      upsert: vi.fn(),
    },
    $transaction: vi.fn(),
  };
}

/**
 * Creates a mock Next.js router object for use inside vi.mock("next/navigation") factories.
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  };
}
