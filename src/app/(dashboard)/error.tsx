"use client";

import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import { ErrorCard } from "@/components/ui/error-card";

interface ErrorBoundaryProps {
  error: Error;
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorBoundaryProps) {
  const isAuthError = /session|auth|unauthorized/i.test(error.message);

  return (
    <ErrorCard
      icon="!"
      title="Something went wrong"
      description={
        isAuthError
          ? "Your session may have expired. Please log in again."
          : "An unexpected error occurred."
      }
    >
      {isAuthError ? (
        <LinkButton href="/login">Go to login</LinkButton>
      ) : (
        <Button onClick={reset}>Try again</Button>
      )}
    </ErrorCard>
  );
}
