import { Separator } from "@/components/ui/separator";

// ─── Number Formatter ─────────────────────────────────────────────────────────

const numberFormatter = new Intl.NumberFormat();

// ─── Types ────────────────────────────────────────────────────────────────────

interface SupplyFooterTotalsProps {
  totalStitchCount: number;
  totalSkeinsNeeded: number;
  totalAcquired: number;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SupplyFooterTotals({
  totalStitchCount,
  totalSkeinsNeeded,
  totalAcquired,
}: SupplyFooterTotalsProps) {
  return (
    <div className="mt-2">
      <Separator />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3 text-sm">
        <span className="font-semibold">Totals:</span>
        <span className="font-mono font-semibold tabular-nums">
          {numberFormatter.format(totalStitchCount)} stitches
        </span>
        <span className="text-border hidden md:inline">|</span>
        <span className="font-mono font-semibold tabular-nums">
          {numberFormatter.format(totalSkeinsNeeded)} skeins needed
        </span>
        <span className="text-border hidden md:inline">|</span>
        <span className="font-mono font-semibold tabular-nums">
          {numberFormatter.format(totalAcquired)} acquired
        </span>
      </div>
    </div>
  );
}
