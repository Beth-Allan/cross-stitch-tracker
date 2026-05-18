import Link from "next/link";
import { Target } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { CompletionEstimate } from "@/types/stats";

interface CompletionEstimatesSectionProps {
  items: CompletionEstimate[];
}

export function CompletionEstimatesSection({ items }: CompletionEstimatesSectionProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Target className="text-primary h-4 w-4" />
          Completion Estimates
        </h3>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-xs">
          Based on your average stitching pace
        </p>
        {items.length === 0 ? (
          <>
            <p className="text-muted-foreground py-4 text-sm">No estimates available</p>
            <p className="text-muted-foreground text-xs">
              Estimates appear for active projects with a stitch target and at least 3 logged
              sessions.
            </p>
          </>
        ) : (
          <div>
            {items.map((item) => (
              <div
                key={item.projectId}
                className="border-border border-b py-3 last:border-0"
              >
                <div className="mb-1 flex items-center justify-between">
                  <Link
                    href={`/charts/${item.chartId}`}
                    className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm font-medium underline underline-offset-2 transition-colors"
                  >
                    {item.projectName}
                  </Link>
                  <span className="text-muted-foreground font-mono text-sm tabular-nums">
                    {item.estimatedDate}
                  </span>
                </div>
                <div className="mb-1 flex items-center gap-2">
                  <div className="bg-muted h-1.5 flex-1 overflow-hidden rounded-full">
                    <div
                      className="bg-progress h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.percentComplete}%` }}
                      role="progressbar"
                      aria-valuenow={item.percentComplete}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${item.projectName} completion`}
                    />
                  </div>
                  <span className="text-muted-foreground w-8 text-right font-mono text-xs font-semibold tabular-nums">
                    {item.percentComplete}%
                  </span>
                </div>
                <p className="text-muted-foreground text-xs">
                  {item.stitchesCompleted.toLocaleString()} of{" "}
                  {item.totalStitches.toLocaleString()} stitches
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
