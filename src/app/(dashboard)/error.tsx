"use client";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  const isAuthError = /session|auth|unauthorized/i.test(error.message);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <span className="text-muted-foreground text-xl" aria-hidden="true">
            !
          </span>
        </div>

        <h2 className="font-heading text-foreground text-lg font-semibold">Something went wrong</h2>

        {isAuthError ? (
          <>
            <p className="text-muted-foreground mt-2 text-sm">
              Your session may have expired. Please log in again.
            </p>
            <LinkButton href="/login" className="mt-6">
              Go to login
            </LinkButton>
          </>
        ) : (
          <>
            <p className="text-muted-foreground mt-2 text-sm">An unexpected error occurred.</p>
            <Button onClick={reset} className="mt-6">
              Try again
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
