import type { ProjectStatus } from "@/generated/prisma/client";
import type { OptionalFocalPoint } from "@/types/focal-point";

export type SeriesProgress = {
  ownedCount: number;
  finishedCount: number;
  totalCount: number | null;
};

export type SeriesWithStats = {
  id: string;
  name: string;
  totalCount: number | null;
  designerId: string | null;
  designerName: string | null;
  notes: string | null;
  progress: SeriesProgress;
};

export type SeriesChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
};

export type SeriesDetail = SeriesWithStats & {
  charts: SeriesChart[];
};
