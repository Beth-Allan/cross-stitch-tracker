import type { ProjectSupplies } from "@/lib/queries/project-supplies";
import type {
  Chart,
  ChartFile,
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

export type ChartFileData = Pick<
  ChartFile,
  "id" | "url" | "filename" | "mimeType" | "fileSize" | "label" | "notes" | "createdAt"
>;

export type ChartWithProject = Chart & {
  project: ProjectWithRelations | null;
  designer: Designer | null;
  genres: Genre[];
  files: ChartFileData[];
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
  supplies: ProjectSupplies;
};

export type GalleryChartData = Chart & {
  project: GalleryProjectData | null;
  designer: Designer | null;
  genres: Genre[];
  series: { id: string; name: string } | null;
  _count?: { files: number };
};
