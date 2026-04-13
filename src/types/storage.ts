import type { ProjectStatus } from "@/generated/prisma/client";

export type EntityProject = {
  id: string;
  chart: { id: string; name: string; coverThumbnailUrl: string | null };
  status: ProjectStatus;
  fabric: { name: string; count: number; type: string } | null;
};

export interface StorageLocationWithStats {
  id: string;
  name: string;
  description: string | null;
  projectCount: number;
}

export interface StorageLocationDetail {
  id: string;
  name: string;
  description: string | null;
  projects: EntityProject[];
}

export interface StitchingAppWithStats {
  id: string;
  name: string;
  description: string | null;
  projectCount: number;
}

export interface StitchingAppDetail {
  id: string;
  name: string;
  description: string | null;
  projects: EntityProject[];
}
