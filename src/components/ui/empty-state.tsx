import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  heading?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  heading = false,
  children,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn("py-12 text-center", className)}>
      <Icon className="text-muted-foreground/40 mx-auto mb-3 h-8 w-8" />
      {heading ? (
        <h2 className="font-heading text-lg font-semibold">{title}</h2>
      ) : (
        <p className="text-muted-foreground text-sm">{title}</p>
      )}
      {description && (
        <p className="text-muted-foreground mx-auto mt-1.5 max-w-xs text-sm">{description}</p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
