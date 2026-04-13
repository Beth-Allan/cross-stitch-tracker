"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground font-body antialiased">
        <div className="flex min-h-screen items-center justify-center px-4">
          <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
            <div className="bg-destructive/10 mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
              <span className="text-destructive text-xl" aria-hidden="true">
                !
              </span>
            </div>

            <h2 className="text-lg font-semibold">Something went wrong</h2>

            <p className="text-muted-foreground mt-2 text-sm">
              An unexpected error occurred. Please try again or refresh the page.
            </p>

            {error.digest && (
              <p className="text-muted-foreground/70 mt-1 text-xs">Error ID: {error.digest}</p>
            )}

            <button
              onClick={reset}
              className="bg-primary text-primary-foreground hover:bg-primary/90 mt-6 inline-flex h-9 items-center justify-center rounded-lg px-4 text-sm font-medium transition-colors"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
