import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, max, className, color = "bg-emerald-500" }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="h-2 flex-1 rounded-full bg-stone-100 dark:bg-stone-800">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="font-mono text-sm text-stone-600 tabular-nums dark:text-stone-400">
        {percentage}%
      </span>
    </div>
  );
}
