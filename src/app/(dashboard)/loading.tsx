export default function DashboardLoading() {
  return (
    <div className="mx-auto max-w-[1100px] space-y-16">
      {/* Page header + Quick Add */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="bg-muted animate-skeleton-pulse h-8 w-44 rounded-lg" />
          <div className="bg-muted animate-skeleton-pulse mt-2 h-4 w-72 rounded" />
        </div>
        <div className="bg-muted animate-skeleton-pulse h-10 w-32 rounded-xl" />
      </div>

      {/* Tabs skeleton */}
      <div className="border-border flex gap-6 border-b pb-2">
        <div className="bg-muted animate-skeleton-pulse h-5 w-20 rounded" />
        <div className="bg-muted animate-skeleton-pulse h-5 w-20 rounded" />
      </div>

      {/* Two-column: main + sidebar */}
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0 space-y-12">
          {/* Currently Stitching section */}
          <section>
            <div className="bg-muted animate-skeleton-pulse h-5 w-40 rounded" />
            <div className="mt-4 flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border-border bg-card w-56 shrink-0 rounded-xl border p-3">
                  <div className="bg-muted animate-skeleton-pulse h-32 w-full rounded-lg" />
                  <div className="bg-muted animate-skeleton-pulse mt-3 h-4 w-3/4 rounded" />
                  <div className="bg-muted animate-skeleton-pulse mt-2 h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          </section>

          {/* Start Next section */}
          <section>
            <div className="bg-muted animate-skeleton-pulse h-5 w-24 rounded" />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="border-border bg-card rounded-xl border">
                  <div className="bg-muted animate-skeleton-pulse h-44 w-full rounded-t-xl" />
                  <div className="p-3">
                    <div className="bg-muted animate-skeleton-pulse h-4 w-2/3 rounded" />
                    <div className="bg-muted animate-skeleton-pulse mt-2 h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 max-lg:mt-12">
          <div className="bg-muted animate-skeleton-pulse h-5 w-36 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="bg-muted animate-skeleton-pulse h-4 w-24 rounded" />
              <div className="bg-muted animate-skeleton-pulse h-5 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>

      {/* Spotlight section */}
      <div className="border-border bg-card rounded-xl border p-6">
        <div className="bg-muted animate-skeleton-pulse mb-3 h-4 w-32 rounded" />
        <div className="bg-muted animate-skeleton-pulse h-5 w-56 rounded" />
        <div className="bg-muted animate-skeleton-pulse mt-2 h-4 w-40 rounded" />
      </div>
    </div>
  );
}
