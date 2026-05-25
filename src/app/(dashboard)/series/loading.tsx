export default function SeriesLoading() {
  return (
    <div className="space-y-6" aria-label="Loading series">
      <div className="flex items-center justify-between" aria-hidden="true">
        <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
      </div>

      <div className="flex gap-2" aria-hidden="true">
        <div className="bg-muted animate-skeleton-pulse h-6 w-20 rounded-full" />
        <div className="bg-muted animate-skeleton-pulse h-6 w-20 rounded-full" />
        <div className="bg-muted animate-skeleton-pulse h-6 w-20 rounded-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-5">
            <div className="space-y-3">
              <div className="bg-muted animate-skeleton-pulse h-5 w-36 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-2 w-full rounded-full" />
              <div className="flex gap-4">
                <div className="bg-muted animate-skeleton-pulse h-4 w-20 rounded" />
                <div className="bg-muted animate-skeleton-pulse h-4 w-16 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
