"use client";

import { Sparkles } from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@/components/ui/tooltip";

/**
 * Words true of every line the sparkle can sit on. It marks each need not typed by hand, so it
 * also sits beside an Unknown need and beside a number with no stitch count behind it, which can
 * be more than the 1 a line starts at. Only a known need with a stitch count is called calculated.
 */
function autoCalcHint(stitchCount: number, need: number | null): string {
  if (need === null) return "Not calculated yet";
  if (stitchCount <= 0) return "No stitch count to calculate from yet";
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
