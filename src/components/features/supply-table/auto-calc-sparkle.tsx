"use client";

import { Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

/**
 * Words true of the line the sparkle sits on. It marks every need not typed by hand, which
 * includes a line with no stitch count, whose 1 is only where it starts, and an Unknown need,
 * which was never worked out: saying "calculated" on either would pass them off as real figures.
 */
function autoCalcHint(stitchCount: number, need: number | null): string {
  if (need === null) return "Can't be calculated: this thread's skein details aren't known yet";
  if (stitchCount <= 0) return "No stitch count yet, so this starts at 1";
  return "Auto-calculated from the stitch count";
}

/**
 * A span rather than the trigger's default button: it sits between the number cells on every
 * thread line, and a button would add a Tab stop to each one.
 */
export function AutoCalcSparkle({
  stitchCount,
  need,
}: {
  stitchCount: number;
  need: number | null;
}) {
  const hint = autoCalcHint(stitchCount, need);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<span role="img" />}
          aria-label={hint}
          className="inline-flex shrink-0 cursor-default p-0.5"
          data-testid="auto-calc-indicator"
        >
          <Sparkles className="text-primary h-3 w-3" />
        </TooltipTrigger>
        <TooltipContent>{hint}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
