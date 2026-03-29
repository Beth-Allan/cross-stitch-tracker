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
        "flex items-start justify-between gap-4 border-b border-stone-100 py-2.5 last:border-b-0 dark:border-stone-800/60",
        className,
      )}
    >
      <span className="shrink-0 text-xs font-semibold tracking-wider text-stone-500 uppercase dark:text-stone-400">
        {label}
      </span>
      <span className="text-right text-sm text-stone-700 dark:text-stone-300">{value}</span>
    </div>
  );
}
