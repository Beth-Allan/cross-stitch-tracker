export default function StatsLoading() {
  return (
    <div className="space-y-8">
      {/* Tab skeleton */}
      <div className="flex gap-4 border-b border-border pb-2">
        <div className="bg-muted animate-skeleton-pulse h-8 w-20 rounded" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-20 rounded" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-20 rounded" />
      </div>

      {/* Hero counter skeletons */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-4">
            <div className="bg-muted animate-skeleton-pulse mb-2 h-4 w-20 rounded" />
            <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded" />
          </div>
        ))}
      </div>

      {/* Chart skeleton */}
      <div className="rounded-lg border border-border bg-card p-6">
        <div className="bg-muted animate-skeleton-pulse mb-4 h-4 w-32 rounded" />
        <div className="bg-muted animate-skeleton-pulse mx-auto h-[250px] w-[250px] rounded-full" />
      </div>
    </div>
  );
}
