export default function SuppliesLoading() {
  return (
    <div className="space-y-6">
      {/* Header: title + description */}
      <div>
        <div className="bg-muted animate-skeleton-pulse h-8 w-40 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse mt-1.5 h-4 w-80 rounded" />
      </div>

      {/* Tabs + view toggle */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <div className="bg-muted animate-skeleton-pulse h-8 w-24 rounded-lg" />
          <div className="bg-muted animate-skeleton-pulse h-8 w-20 rounded-lg" />
          <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
        </div>
        <div className="bg-muted animate-skeleton-pulse h-8 w-20 rounded-lg" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3">
        <div className="bg-muted animate-skeleton-pulse h-8 w-48 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
      </div>

      {/* Grid of supply cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="border-border bg-card rounded-xl border p-3">
            <div className="bg-muted animate-skeleton-pulse mb-2 h-8 w-8 rounded-full" />
            <div className="bg-muted animate-skeleton-pulse mb-1.5 h-4 w-full rounded" />
            <div className="bg-muted animate-skeleton-pulse h-3 w-2/3 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
