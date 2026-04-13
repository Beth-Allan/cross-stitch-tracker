export default function ShoppingLoading() {
  return (
    <div className="space-y-6">
      {/* Header: title + description */}
      <div>
        <div className="bg-muted animate-skeleton-pulse h-8 w-36 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse mt-1.5 h-4 w-64 rounded" />
      </div>

      {/* Project cards */}
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="border-border bg-card rounded-xl border p-4">
          {/* Project header */}
          <div className="mb-3 flex items-center gap-3">
            <div className="bg-muted animate-skeleton-pulse h-5 w-5 rounded-full" />
            <div className="bg-muted animate-skeleton-pulse h-5 w-48 rounded" />
          </div>
          {/* Supply rows */}
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 px-2 py-1.5">
                <div className="bg-muted animate-skeleton-pulse h-6 w-6 rounded-full" />
                <div className="bg-muted animate-skeleton-pulse h-4 w-32 rounded" />
                <div className="flex-1" />
                <div className="bg-muted animate-skeleton-pulse h-7 w-24 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
