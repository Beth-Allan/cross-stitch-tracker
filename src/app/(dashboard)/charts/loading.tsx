export default function ChartsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-28 rounded-lg" />
      </div>

      {/* Table skeleton */}
      <div className="border-border bg-card overflow-hidden rounded-xl border">
        <div className="border-border/60 border-b px-4 py-3">
          <div className="bg-muted animate-skeleton-pulse h-4 w-48 rounded" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="border-border/60 flex items-center gap-4 border-b px-4 py-3 last:border-b-0"
          >
            <div className="bg-muted animate-skeleton-pulse h-10 w-10 shrink-0 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <div className="bg-muted animate-skeleton-pulse h-4 w-48 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-3 w-24 rounded" />
            </div>
            <div className="bg-muted animate-skeleton-pulse hidden h-4 w-16 rounded sm:block" />
            <div className="bg-muted animate-skeleton-pulse h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
