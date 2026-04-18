import type { ProjectStatus } from "@/generated/prisma/client";

export const STATUS_CONFIG: Record<
  ProjectStatus,
  {
    label: string;
    cssVar: string;
    bgClass: string;
    textClass: string;
    dotClass: string;
    darkBgClass: string;
  }
> = {
  UNSTARTED: {
    label: "Unstarted",
    cssVar: "--status-unstarted",
    bgClass: "bg-muted",
    textClass: "text-muted-foreground",
    dotClass: "bg-muted-foreground/60",
    darkBgClass: "",
  },
  KITTING: {
    label: "Kitting",
    cssVar: "--status-kitting",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700 dark:text-amber-300",
    dotClass: "bg-amber-500",
    darkBgClass: "dark:bg-amber-950/40",
  },
  KITTED: {
    label: "Ready",
    cssVar: "--status-kitted",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700 dark:text-emerald-300",
    dotClass: "bg-emerald-500",
    darkBgClass: "dark:bg-emerald-950/40",
  },
  IN_PROGRESS: {
    label: "Stitching",
    cssVar: "--status-in-progress",
    bgClass: "bg-sky-50",
    textClass: "text-sky-700 dark:text-sky-300",
    dotClass: "bg-sky-500",
    darkBgClass: "dark:bg-sky-950/40",
  },
  ON_HOLD: {
    label: "On Hold",
    cssVar: "--status-on-hold",
    bgClass: "bg-orange-50",
    textClass: "text-orange-700 dark:text-orange-300",
    dotClass: "bg-orange-400",
    darkBgClass: "dark:bg-orange-950/40",
  },
  FINISHED: {
    label: "Finished",
    cssVar: "--status-finished",
    bgClass: "bg-violet-50",
    textClass: "text-violet-700 dark:text-violet-300",
    dotClass: "bg-violet-500",
    darkBgClass: "dark:bg-violet-950/40",
  },
  FFO: {
    label: "FFO",
    cssVar: "--status-ffo",
    bgClass: "bg-rose-50",
    textClass: "text-rose-700 dark:text-rose-300",
    dotClass: "bg-rose-500",
    darkBgClass: "dark:bg-rose-950/40",
  },
};

export const PROJECT_STATUSES = Object.keys(STATUS_CONFIG) as ProjectStatus[];
