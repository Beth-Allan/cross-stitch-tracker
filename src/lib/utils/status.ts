import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    cssVar: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
  }
> = {
  UNSTARTED: {
    label: "Unstarted",
    cssVar: "--status-unstarted",
    bgClass: "bg-[var(--status-unstarted-bg)]",
    textClass: "text-[var(--status-unstarted-text)]",
    dotClass: "bg-[var(--status-unstarted-dot)]",
  },
  KITTING: {
    label: "Kitting",
    cssVar: "--status-kitting",
    bgClass: "bg-[var(--status-kitting-bg)]",
    textClass: "text-[var(--status-kitting-text)]",
    dotClass: "bg-[var(--status-kitting-dot)]",
  },
  KITTED: {
    label: "Ready",
    cssVar: "--status-kitted",
    bgClass: "bg-[var(--status-kitted-bg)]",
    textClass: "text-[var(--status-kitted-text)]",
    dotClass: "bg-[var(--status-kitted-dot)]",
  },
  IN_PROGRESS: {
    label: "Stitching",
    cssVar: "--status-in-progress",
    bgClass: "bg-[var(--status-in-progress-bg)]",
    textClass: "text-[var(--status-in-progress-text)]",
    dotClass: "bg-[var(--status-in-progress-dot)]",
  },
  ON_HOLD: {
    label: "On Hold",
    cssVar: "--status-on-hold",
    bgClass: "bg-[var(--status-on-hold-bg)]",
    textClass: "text-[var(--status-on-hold-text)]",
    dotClass: "bg-[var(--status-on-hold-dot)]",
  },
  FINISHED: {
    label: "Finished",
    cssVar: "--status-finished",
    bgClass: "bg-[var(--status-finished-bg)]",
    textClass: "text-[var(--status-finished-text)]",
    dotClass: "bg-[var(--status-finished-dot)]",
  },
  FFO: {
    label: "FFO",
    cssVar: "--status-ffo",
    bgClass: "bg-[var(--status-ffo-bg)]",
    textClass: "text-[var(--status-ffo-text)]",
    dotClass: "bg-[var(--status-ffo-dot)]",
  },
};

export const PROJECT_STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[];
