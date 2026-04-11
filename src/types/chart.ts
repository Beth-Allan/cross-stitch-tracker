import type {
  Chart,
  Project,
  Designer,
  Fabric,
  FabricBrand,
  Genre,
  ProjectStatus,
  StorageLocation,
  StitchingApp,
} from "@/generated/prisma/client";
import type { SizeCategory } from "@/lib/utils/size-category";

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

export type ChartListItem = {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  designerName: string | null;
  status: ProjectStatus;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  sizeCategory: SizeCategory;
  dateAdded: Date;
};

export type ChartDetail = ChartWithProject & {
  effectiveStitchCount: number;
  stitchCountIsApproximate: boolean;
  sizeCategory: SizeCategory;
};
