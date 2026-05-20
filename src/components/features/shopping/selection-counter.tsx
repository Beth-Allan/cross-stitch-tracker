interface SelectionCounterProps {
  selectedCount: number;
  totalCount: number;
  visibleCount: number;
  visibleSelectedCount: number;
  isSearchActive: boolean;
}

export function SelectionCounter({
  selectedCount,
  totalCount,
  visibleCount,
  visibleSelectedCount,
  isSearchActive,
}: SelectionCounterProps) {
  if (isSearchActive) {
    const showTotal = selectedCount !== visibleSelectedCount;

    return (
      <p className="text-muted-foreground text-sm" aria-live="polite">
        {visibleSelectedCount} of {visibleCount} visible selected
        {showTotal && ` (${selectedCount} total selected)`}
      </p>
    );
  }

  return (
    <p className="text-muted-foreground text-sm" aria-live="polite">
      {selectedCount} of {totalCount} project{totalCount !== 1 ? "s" : ""} selected
    </p>
  );
}
