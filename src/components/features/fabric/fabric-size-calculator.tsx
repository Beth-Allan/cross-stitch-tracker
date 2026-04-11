import {
  calculateRequiredFabricSize,
  doesFabricFit,
} from "@/lib/utils/fabric-calculator";
import { Badge } from "@/components/ui/badge";

interface FabricSizeCalculatorProps {
  fabric: {
    count: number;
    shortestEdgeInches: number;
    longestEdgeInches: number;
  };
  project: {
    stitchesWide: number;
    stitchesHigh: number;
  } | null;
}

export function FabricSizeCalculator({ fabric, project }: FabricSizeCalculatorProps) {
  // Only render when project has valid stitch dimensions
  if (!project || project.stitchesWide <= 0 || project.stitchesHigh <= 0) {
    return null;
  }

  const required = calculateRequiredFabricSize(
    project.stitchesWide,
    project.stitchesHigh,
    fabric.count,
  );

  const fits = doesFabricFit(
    {
      shortestEdgeInches: fabric.shortestEdgeInches,
      longestEdgeInches: fabric.longestEdgeInches,
    },
    required,
  );

  return (
    <div className="border-border mt-6 border-t pt-6">
      <h2 className="font-heading text-base font-semibold">Size Calculator</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-muted/50 border-border rounded-lg border p-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Required
          </p>
          <p className="text-foreground mt-1 text-sm font-medium">
            {required.requiredWidthInches.toFixed(1)}&quot; x{" "}
            {required.requiredHeightInches.toFixed(1)}&quot;
          </p>
        </div>

        <div className="bg-muted/50 border-border rounded-lg border p-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Available
          </p>
          <p className="text-foreground mt-1 text-sm font-medium">
            {fabric.shortestEdgeInches}&quot; x {fabric.longestEdgeInches}&quot;
          </p>
        </div>

        <div className="bg-muted/50 border-border rounded-lg border p-3">
          <p className="text-muted-foreground text-xs font-semibold uppercase tracking-wider">
            Status
          </p>
          <div className="mt-1">
            {fits ? (
              <Badge className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400">
                Fits
              </Badge>
            ) : (
              <Badge className="border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                Too small
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
