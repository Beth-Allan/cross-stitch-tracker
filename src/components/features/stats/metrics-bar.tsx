import { Zap, CalendarDays, CalendarRange, TrendingUp } from "lucide-react";

interface MetricsBarProps {
  stitchesToday: number;
  stitchesThisWeek: number;
  stitchesThisMonth: number;
  stitchesThisYear: number;
}

const METRIC_CELLS = [
  { key: "stitchesToday" as const, label: "TODAY", icon: Zap },
  { key: "stitchesThisWeek" as const, label: "THIS WEEK", icon: CalendarDays },
  { key: "stitchesThisMonth" as const, label: "THIS MONTH", icon: CalendarRange },
  { key: "stitchesThisYear" as const, label: "THIS YEAR", icon: TrendingUp },
];

export function MetricsBar(props: MetricsBarProps) {
  return (
    <div className="bg-success-muted border-success-border grid grid-cols-2 rounded-xl border sm:flex sm:flex-row">
      {METRIC_CELLS.map((cell, index) => {
        const Icon = cell.icon;
        const value = props[cell.key];

        return (
          <div key={cell.key} className="flex items-center sm:flex-1">
            <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
              <div className="flex items-center gap-1.5">
                <Icon className="text-success h-4 w-4" />
                <span className="text-success-muted-foreground text-xs font-semibold uppercase tracking-wider">
                  {cell.label}
                </span>
              </div>
              <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
                {value.toLocaleString()}
              </span>
              <span className="text-muted-foreground text-xs">stitches</span>
            </div>
            {/* Vertical divider between cells (desktop only, not after last) */}
            {index < METRIC_CELLS.length - 1 && (
              <div className="bg-success-border my-2 hidden w-px self-stretch sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
