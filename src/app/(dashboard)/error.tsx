"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error
  reset: () => void
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  const isAuthError = /session|auth|unauthorized/i.test(error.message)

  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <span className="text-xl text-muted-foreground" aria-hidden="true">!</span>
        </div>

        <h2 className="font-heading text-lg font-semibold text-foreground">
          Something went wrong
        </h2>

        {isAuthError ? (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              Your session may have expired. Please log in again.
            </p>
            <Button render={<Link href="/login" />} className="mt-6">
              Go to login
            </Button>
          </>
        ) : (
          <>
            <p className="mt-2 text-sm text-muted-foreground">
              An unexpected error occurred.
            </p>
            <Button onClick={reset} className="mt-6">
              Try again
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
