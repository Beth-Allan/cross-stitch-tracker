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
          <div className="w-full max-w-md rounded-xl border border-neutral-200 bg-white p-8 text-center shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
              <span className="text-xl text-red-600 dark:text-red-400" aria-hidden="true">
                !
              </span>
            </div>

            <h2 className="text-lg font-semibold">Something went wrong</h2>

            <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
              An unexpected error occurred. Please try again or refresh the page.
            </p>

            {error.digest && (
              <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                Error ID: {error.digest}
              </p>
            )}

            <button
              onClick={reset}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-lg bg-neutral-900 px-4 text-sm font-medium text-white transition-colors hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
