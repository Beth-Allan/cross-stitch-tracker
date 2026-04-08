import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, max, className, color = "bg-primary" }: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(Math.round((value / max) * 100), 100) : 0;

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="bg-muted h-2 flex-1 rounded-full">
        <div
          className={cn("h-full rounded-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground font-mono text-sm tabular-nums">{percentage}%</span>
    </div>
  );
}
