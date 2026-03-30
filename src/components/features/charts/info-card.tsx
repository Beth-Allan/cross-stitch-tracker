import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoCardProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  className?: string;
}

export function InfoCard({ icon: Icon, title, children, className }: InfoCardProps) {
  return (
    <div className={cn("bg-card border-border overflow-hidden rounded-xl border", className)}>
      <div className="border-border flex items-center gap-2 border-b px-5 py-3.5">
        <Icon className="text-muted-foreground h-4 w-4" strokeWidth={1.5} />
        <h3 className="font-heading text-foreground text-sm font-semibold">{title}</h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
