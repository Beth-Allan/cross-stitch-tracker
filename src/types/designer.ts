import type { ProjectStatus } from "@/generated/prisma/client";
import type { OptionalFocalPoint } from "@/types/focal-point";

export type DesignerWithStats = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  chartCount: number;
};

export type DesignerChart = OptionalFocalPoint & {
  id: string;
  name: string;
  coverThumbnailUrl: string | null;
  coverImageUrl: string | null;
  stitchCount: number;
  stitchesWide: number;
  stitchesHigh: number;
  status: ProjectStatus | null;
  stitchesCompleted: number;
  genres: { name: string }[];
};

export type DesignerDetail = {
  id: string;
  name: string;
  website: string | null;
  notes: string | null;
  chartCount: number;
  projectsStarted: number;
  projectsFinished: number;
  topGenre: string | null;
  charts: DesignerChart[];
};
