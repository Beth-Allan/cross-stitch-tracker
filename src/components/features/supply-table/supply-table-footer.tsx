interface SupplyTableFooterProps {
  threadCount: number;
  beadCount: number;
  specialtyCount: number;
  totalSkeinsNeeded: number;
  totalItemsNeeded: number;
}

export function SupplyTableFooter({
  threadCount,
  beadCount,
  specialtyCount,
  totalSkeinsNeeded,
  totalItemsNeeded,
}: SupplyTableFooterProps) {
  const totalCount = threadCount + beadCount + specialtyCount;
  const isMixed =
    (threadCount > 0 && (beadCount > 0 || specialtyCount > 0)) ||
    (beadCount > 0 && specialtyCount > 0);

  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>{isMixed ? `${totalCount} supplies added` : `${totalCount} colours added`}</span>
        <span>
          {isMixed
            ? `Total: ${totalItemsNeeded} items needed`
            : `Total: ${totalSkeinsNeeded} skeins needed`}
        </span>
      </div>
      <span className="text-xs text-muted-foreground/70">
        Enter add &middot; Tab override &middot; Esc clear
      </span>
    </div>
  );
}
