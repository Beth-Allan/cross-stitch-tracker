import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ManageSuppliesLinkProps {
  chartId: string;
}

export function ManageSuppliesLink({ chartId }: ManageSuppliesLinkProps) {
  return (
    <div className="border-border rounded-lg border p-4">
      <p className="text-foreground text-sm">
        Supplies are managed on the project page
      </p>
      <Link
        href={`/charts/${chartId}?tab=supplies`}
        className="text-primary mt-1 inline-flex items-center gap-1 text-sm hover:underline"
      >
        Go to Supplies
        <ArrowRight className="size-4" aria-hidden="true" />
      </Link>
    </div>
  );
}
