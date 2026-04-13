import type {
  Chart,
  Project,
  ProjectStatus,
  Designer,
  Fabric,
  FabricBrand,
  Genre,
  StorageLocation,
  StitchingApp,
} from "@/generated/prisma/client";

export type ProjectWithRelations = Project & {
  storageLocation: Pick<StorageLocation, "id" | "name"> | null;
  stitchingApp: Pick<StitchingApp, "id" | "name"> | null;
  fabric: (Fabric & { brand: FabricBrand }) | null;
};

export type ChartWithProject = Chart & {
  project: ProjectWithRelations | null;
  designer: Designer | null;
  genres: Genre[];
};

// ─── Gallery Query Types ────────────────────────────────────────────────────

export type GalleryProjectData = {
  id: string;
  status: ProjectStatus;
  stitchesCompleted: number;
  startDate: Date | null;
  finishDate: Date | null;
  ffoDate: Date | null;
  fabric: { id: string } | null;
  _count: {
    projectThreads: number;
    projectBeads: number;
    projectSpecialty: number;
  };
};

export type GalleryChartData = Chart & {
  project: GalleryProjectData | null;
  designer: Designer | null;
  genres: Genre[];
};
