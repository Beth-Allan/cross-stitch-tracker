export default function ChartsLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton — matches FilterBar + toolbar row */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="bg-muted animate-skeleton-pulse h-10 w-full max-w-[280px] rounded-lg sm:w-64" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-24 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-20 rounded-lg" />
        <div className="flex-1" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-36 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse h-10 w-24 rounded-lg" />
      </div>

      {/* Gallery card grid skeleton — matches default gallery view */}
      <div
        className="grid gap-6"
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
