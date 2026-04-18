import Link from "next/link";
import type { BucketProject, ProgressBucketId } from "@/types/dashboard";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";

interface BucketProjectRowProps {
  project: BucketProject;
  imageUrl: string | null;
  bucketId: ProgressBucketId;
}

const BUCKET_BAR_COLORS: Record<ProgressBucketId, string> = {
  unstarted: "bg-stone-300 dark:bg-stone-600",
  "0-25": "bg-amber-400 dark:bg-amber-500",
  "25-50": "bg-emerald-400 dark:bg-emerald-500",
  "50-75": "bg-sky-400 dark:bg-sky-500",
  "75-100": "bg-violet-400 dark:bg-violet-500",
};

export function BucketProjectRow({ project, imageUrl, bucketId }: BucketProjectRowProps) {
  const barColor = BUCKET_BAR_COLORS[bucketId];

  return (
    <Link
      href={`/charts/${project.chartId}`}
      className="group flex items-center gap-3 border-t border-border px-5 py-3 transition-colors hover:bg-muted/50"
    >
      {/* Thumbnail */}
      <div className="h-8 w-8 shrink-0 overflow-hidden rounded-lg">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={project.projectName}
            className="h-full w-full object-cover"
          />
        ) : (
          <CoverPlaceholder status={project.status} />
        )}
      </div>

      {/* Name + designer */}
      <div className="min-w-0 flex-1">
        <p className="font-heading truncate text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
          {project.projectName}
        </p>
        {project.designerName && (
          <p className="truncate text-xs text-muted-foreground">{project.designerName}</p>
        )}
      </div>

      {/* Progress bar (hidden on mobile, hidden for unstarted bucket) */}
      {bucketId !== "unstarted" && (
        <div className="hidden w-[100px] shrink-0 md:block">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${project.progressPercent}%` }}
              />
            </div>
            <span className="font-mono text-[11px] font-medium tabular-nums text-muted-foreground">
              {project.progressPercent}%
            </span>
          </div>
        </div>
      )}

      {/* Stitch count */}
      <div className="hidden shrink-0 text-right sm:block" style={{ minWidth: "80px" }}>
        <p className="text-xs tabular-nums text-foreground">
          {project.stitchesCompleted.toLocaleString()}/{project.totalStitches.toLocaleString()}
        </p>
        <p className="text-[10px] text-muted-foreground">stitches</p>
      </div>

      {/* Last stitched (hidden on mobile) */}
      <div className="hidden shrink-0 text-right md:block" style={{ minWidth: "90px" }}>
        {project.lastSessionDate ? (
          <p className="text-xs text-muted-foreground">
            {project.stitchingDays} stitching days
          </p>
        ) : (
          <p className="text-xs text-muted-foreground/70">Not started</p>
        )}
      </div>
    </Link>
  );
}
