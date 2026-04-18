import { LinkButton } from "@/components/ui/link-button";
import { ErrorCard } from "@/components/ui/error-card";

export default function DashboardNotFound() {
  return (
    <ErrorCard
      icon="?"
      title="Page not found"
      description="The page you're looking for doesn't exist or may have been moved."
    >
      <LinkButton href="/">Back to dashboard</LinkButton>
    </ErrorCard>
  );
}
