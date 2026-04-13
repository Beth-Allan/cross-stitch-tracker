import type { ProjectStatus } from "@/generated/prisma/client";

export interface StorageLocationWithStats {
  id: string;
  name: string;
  description: string | null;
  _count: { projects: number };
}

export interface StorageLocationDetail {
  id: string;
  name: string;
  description: string | null;
  projects: {
    id: string;
    chart: {
      id: string;
      name: string;
      coverThumbnailUrl: string | null;
    };
    status: ProjectStatus;
    fabric: {
      name: string;
      count: number;
      type: string;
    } | null;
  }[];
}

export interface StitchingAppWithStats {
  id: string;
  name: string;
  description: string | null;
  _count: { projects: number };
}

export interface StitchingAppDetail {
  id: string;
  name: string;
  description: string | null;
  projects: {
    id: string;
    chart: {
      id: string;
      name: string;
      coverThumbnailUrl: string | null;
    };
    status: ProjectStatus;
    fabric: {
      name: string;
      count: number;
      type: string;
    } | null;
  }[];
}
