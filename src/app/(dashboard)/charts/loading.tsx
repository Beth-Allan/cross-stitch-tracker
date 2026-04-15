export default function ChartsLoading() {
  return (
    <div className="space-y-6">
      {/* Page header skeleton — matches ProjectGallery heading + button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="bg-muted animate-skeleton-pulse h-8 w-48 rounded" />
          <div className="bg-muted animate-skeleton-pulse h-4 w-72 rounded" />
        </div>
        <div className="bg-muted animate-skeleton-pulse h-10 w-32 rounded-lg" />
      </div>

      {/* Filter bar skeleton — search + 2 dropdowns */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-muted animate-skeleton-pulse h-10 w-full max-w-[280px] rounded-lg sm:w-64" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-20 rounded-lg" />
      </div>

      {/* Separator skeleton */}
      <div className="border-border border-b" />

      {/* View toggle bar skeleton — count + sort + view toggle */}
      <div className="flex items-center justify-between">
        <div className="bg-muted animate-skeleton-pulse h-4 w-24 rounded" />
        <div className="flex items-center gap-3">
          <div className="bg-muted animate-skeleton-pulse h-10 w-36 rounded-lg" />
          <div className="bg-muted animate-skeleton-pulse h-10 w-24 rounded-lg" />
        </div>
      </div>

      {/* Gallery card grid skeleton — matches default gallery view */}
      <div
        className="grid justify-center gap-6"
        style={{
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 340px))",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="border-border bg-card overflow-hidden rounded-xl border">
            {/* Cover image area */}
            <div className="bg-muted animate-skeleton-pulse aspect-[4/3]" />
            {/* Card body */}
            <div className="space-y-2.5 p-4">
              <div className="bg-muted animate-skeleton-pulse h-4 w-3/4 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-3.5 w-1/2 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-3 w-1/3 rounded" />
              <div className="pt-2">
                <div className="bg-muted animate-skeleton-pulse h-1.5 w-full rounded-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
