import type { LucideIcon } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
}

export function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="bg-primary/10 mb-5 flex h-14 w-14 items-center justify-center rounded-2xl">
        <Icon className="text-primary/70 h-7 w-7" strokeWidth={1.5} />
      </div>
      <h1 className="font-heading text-foreground mb-2 text-2xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mb-4 max-w-xs text-sm">{description}</p>
      <span className="bg-muted text-muted-foreground inline-flex items-center rounded-full px-3 py-1 text-xs font-medium">
        Coming soon
      </span>
    </div>
  );
}
