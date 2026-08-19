import { cn } from "@/lib/utils";
import { calculateProgressPercent } from "@/lib/utils/progress";

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  color?: string;
}

export function ProgressBar({ value, max, className, color = "bg-primary" }: ProgressBarProps) {
  const percentage = calculateProgressPercent(value, max);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className="bg-muted h-2 flex-1 rounded-full"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${percentage}% complete`}
      >
        <div
          className={cn("h-full rounded-full transition-[width]", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-muted-foreground font-mono text-sm tabular-nums">{percentage}%</span>
    </div>
  );
}
