import type {
  Chart,
  Project,
  Designer,
  Genre,
  ProjectStatus,
} from "@/generated/prisma/client";
import type { SizeCategory } from "@/lib/utils/size-category";

export type ChartWithProject = Chart & {
  project: Project | null;
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
