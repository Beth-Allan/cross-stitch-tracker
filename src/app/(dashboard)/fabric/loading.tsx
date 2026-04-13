export default function FabricLoading() {
  return (
    <div className="space-y-6">
      {/* Header: title + description */}
      <div>
        <div className="bg-muted animate-skeleton-pulse h-8 w-36 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse mt-1.5 h-4 w-72 rounded" />
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
      </div>

      {/* Table */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border/60 flex gap-4 border-b px-4 py-3">
          <div className="bg-muted animate-skeleton-pulse h-4 w-24 rounded" />
          <div className="bg-muted animate-skeleton-pulse h-4 w-20 rounded" />
          <div className="bg-muted animate-skeleton-pulse hidden h-4 w-16 rounded sm:block" />
          <div className="bg-muted animate-skeleton-pulse hidden h-4 w-20 rounded md:block" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted animate-skeleton-pulse h-4 w-44 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-3 w-24 rounded" />
            </div>
            <div className="bg-muted animate-skeleton-pulse hidden h-4 w-16 rounded sm:block" />
            <div className="bg-muted animate-skeleton-pulse hidden h-4 w-20 rounded md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
