export default function ChartsLoading() {
  const stitches = Array.from({ length: 16 }, (_, i) => i);

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

      {/* Cross-stitch loading animation — squares fill in like stitches */}
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <style>{`
          @keyframes stitch-fill {
            0% { opacity: 0.08; transform: scale(0.5); }
            12% { opacity: 0.5; transform: scale(1); }
            65% { opacity: 0.5; transform: scale(1); }
            80% { opacity: 0.08; transform: scale(0.5); }
            100% { opacity: 0.08; transform: scale(0.5); }
          }
        `}</style>
        <div className="grid grid-cols-4 gap-1.5">
          {stitches.map((i) => (
            <div
              key={i}
              className="bg-muted-foreground size-3 rounded-sm"
              style={{
                animation: "stitch-fill 3.5s ease-in-out infinite",
                animationDelay: `${i * 0.12}s`,
                opacity: 0.08,
              }}
            />
          ))}
        </div>
        <p className="text-muted-foreground/50 text-sm">Loading your projects&hellip;</p>
      </div>
    </div>
  );
}
