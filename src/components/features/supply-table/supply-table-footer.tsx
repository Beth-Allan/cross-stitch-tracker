interface SupplyTableFooterProps {
  threadCount: number;
  beadCount: number;
  specialtyCount: number;
  totalSkeinsNeeded: number;
  totalItemsNeeded: number;
  /** Thread colours whose need is unknown — left out of both totals, never counted as 0. */
  unknownNeedCount: number;
}

export function SupplyTableFooter({
  threadCount,
  beadCount,
  specialtyCount,
  totalSkeinsNeeded,
  totalItemsNeeded,
  unknownNeedCount,
}: SupplyTableFooterProps) {
  const totalCount = threadCount + beadCount + specialtyCount;
  const isMixed =
    (threadCount > 0 && (beadCount > 0 || specialtyCount > 0)) ||
    (beadCount > 0 && specialtyCount > 0);

  return (
    <div className="border-border text-muted-foreground flex items-center justify-between border-t px-4 py-3 text-sm">
      <div className="flex items-center gap-4">
        <span>
          {isMixed
            ? `${totalCount} ${totalCount === 1 ? "supply" : "supplies"} added`
            : `${totalCount} ${totalCount === 1 ? "colour" : "colours"} added`}
        </span>
        <span>{totalLabel(isMixed, totalSkeinsNeeded, totalItemsNeeded, unknownNeedCount)}</span>
      </div>
      <span className="text-muted-foreground/70 text-xs">
        Enter add &middot; Tab override &middot; Esc clear
      </span>
    </div>
  );
}

function totalLabel(
  isMixed: boolean,
  totalSkeinsNeeded: number,
  totalItemsNeeded: number,
  unknownNeedCount: number,
): string {
  const known = isMixed ? `${totalItemsNeeded} items needed` : `${totalSkeinsNeeded} skeins needed`;
  if (unknownNeedCount === 0) return `Total: ${known}`;
  // Every known need is at least 1, so a known total of 0 means nothing is known
  if ((isMixed ? totalItemsNeeded : totalSkeinsNeeded) === 0) return "Total: Unknown";
  const colours = unknownNeedCount === 1 ? "colour" : "colours";
  return `Total: ${known}, plus ${unknownNeedCount} ${colours} unknown`;
}
