"use client"

import Link from "next/link"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  const isAuthError = /session|auth|unauthorized/i.test(error.message)

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-stone-100 dark:bg-stone-900">
          <span className="text-xl text-stone-500 dark:text-stone-400" aria-hidden="true">!</span>
        </div>

        <h2 className="font-heading text-lg font-semibold text-stone-900 dark:text-stone-100">
          Something went wrong
        </h2>

        {isAuthError ? (
          <>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              Your session may have expired. Please log in again.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-emerald-950"
            >
              Go to login
            </Link>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-stone-500 dark:text-stone-400">
              An unexpected error occurred.
            </p>
            <button
              onClick={reset}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 dark:text-emerald-950"
            >
              Try again
            </button>
          </>
        )}
      </div>
    </div>
  )
}
