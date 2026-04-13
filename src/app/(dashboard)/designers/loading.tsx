export default function DesignersLoading() {
  return (
    <div className="space-y-6">
      {/* Header: title + button */}
      <div className="flex items-center justify-between">
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
      </div>

      {/* Search bar */}
      <div className="bg-muted animate-skeleton-pulse h-8 w-64 rounded-lg" />

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        {/* Table header */}
        <div className="border-border/60 flex gap-4 border-b px-4 py-3">
          <div className="bg-muted animate-skeleton-pulse h-4 w-32 rounded" />
          <div className="bg-muted animate-skeleton-pulse h-4 w-20 rounded" />
          <div className="bg-muted animate-skeleton-pulse hidden h-4 w-24 rounded sm:block" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted animate-skeleton-pulse h-4 w-40 rounded" />
            </div>
            <div className="bg-muted animate-skeleton-pulse h-4 w-12 rounded" />
            <div className="bg-muted animate-skeleton-pulse hidden h-4 w-16 rounded sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
