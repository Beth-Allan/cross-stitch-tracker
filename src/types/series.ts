import type { ProjectStatus } from "@/generated/prisma/client";

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

export type SeriesChart = {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  status: ProjectStatus | null;
  stitchesCompleted: number;
  stitchCount: number;
};

export type SeriesDetail = SeriesWithStats & {
  charts: SeriesChart[];
};
