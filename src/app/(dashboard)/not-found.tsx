import { LinkButton } from "@/components/ui/link-button";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-8 text-center shadow-sm">
        <div className="bg-muted mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
          <span className="text-muted-foreground text-2xl" aria-hidden="true">
            ?
          </span>
        </div>

        <h2 className="font-heading text-foreground text-lg font-semibold">Page not found</h2>

        <p className="text-muted-foreground mt-2 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or may have been moved.
        </p>

        <LinkButton href="/" className="mt-6">
          Back to dashboard
        </LinkButton>
      </div>
    </div>
  );
}
