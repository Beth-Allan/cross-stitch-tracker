import type {
  Chart,
  Project,
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
