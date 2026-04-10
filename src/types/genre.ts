import type { ProjectStatus } from "@/generated/prisma/client";

export type GenreWithStats = {
  id: string;
  name: string;
  chartCount: number;
};

export type GenreChart = {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
};

export type GenreDetail = {
  id: string;
  name: string;
  chartCount: number;
  charts: GenreChart[];
};
