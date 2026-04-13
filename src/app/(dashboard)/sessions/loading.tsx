export default function SessionsLoading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <div className="bg-muted animate-skeleton-pulse mx-auto mb-4 h-12 w-12 rounded-full" />
        <div className="bg-muted animate-skeleton-pulse mx-auto mb-2 h-6 w-32 rounded-lg" />
        <div className="bg-muted animate-skeleton-pulse mx-auto h-4 w-64 rounded" />
      </div>
    </div>
  );
}
