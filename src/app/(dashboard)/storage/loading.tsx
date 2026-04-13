export default function StorageLoading() {
  return (
    <div className="px-6 pt-6 pb-4">
      {/* Header: title + button */}
      <div className="mb-5 flex items-center justify-between">
        <div className="bg-muted animate-skeleton-pulse h-8 w-44 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-8 w-32 rounded-lg" />
      </div>

      {/* List rows */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="border-border bg-card flex items-center gap-3 rounded-lg border px-4 py-3"
          >
            <div className="bg-muted animate-skeleton-pulse h-4 w-4 rounded" />
            <div className="bg-muted animate-skeleton-pulse h-4 w-40 rounded" />
            <div className="flex-1" />
            <div className="bg-muted animate-skeleton-pulse h-4 w-16 rounded" />
            <div className="bg-muted animate-skeleton-pulse h-4 w-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
