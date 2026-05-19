import { Target } from "lucide-react";
import type { CompletionEstimate } from "@/types/stats";

interface ProjectCompletionEstimateProps {
  estimate: CompletionEstimate | null;
}

export function ProjectCompletionEstimate({ estimate }: ProjectCompletionEstimateProps) {
  if (!estimate) return null;

  return (
    <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-3">
      <Target className="text-primary h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-foreground text-sm font-medium">Est. completion</span>
          <span className="text-muted-foreground font-mono text-sm tabular-nums">
            ~{estimate.estimatedDate}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
            <div
              className="bg-progress h-full rounded-full transition-all duration-300"
              style={{ width: `${estimate.percentComplete}%` }}
              role="progressbar"
              aria-valuenow={estimate.percentComplete}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
          <span className="text-muted-foreground w-8 text-right font-mono text-xs tabular-nums">
            {estimate.percentComplete}%
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {estimate.stitchesCompleted.toLocaleString()} of {estimate.totalStitches.toLocaleString()}{" "}
          stitches
        </p>
      </div>
    </div>
  );
}
