import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface DetailRowProps {
  label: string;
  value: ReactNode;
  className?: string;
}

export function DetailRow({ label, value, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "border-border/60 flex items-start justify-between gap-4 border-b py-2.5 last:border-b-0",
        className,
      )}
    >
      <span className="text-muted-foreground shrink-0 text-xs font-semibold tracking-wider uppercase">
        {label}
      </span>
      <span className="text-foreground text-right text-sm">{value}</span>
    </div>
  );
}
