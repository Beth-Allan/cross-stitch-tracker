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
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-stone-200/60 bg-white dark:border-stone-800 dark:bg-stone-900",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-3.5 dark:border-stone-800">
        <Icon className="h-4 w-4 text-stone-400 dark:text-stone-500" strokeWidth={1.5} />
        <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100">
          {title}
        </h3>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}
