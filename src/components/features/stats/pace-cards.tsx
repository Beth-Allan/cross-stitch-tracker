import { Activity, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import type { PaceMetricsData } from "@/types/stats";

interface PaceCardsProps {
  paceMetrics: PaceMetricsData;
}

function getMoMPercentage(thisMonth: number, lastMonth: number): number {
  if (lastMonth === 0 && thisMonth === 0) return 0;
  if (lastMonth === 0 && thisMonth > 0) return 100;
  return Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
}

function getTrendColor(value: number): string {
  if (value > 0) return "text-success";
  if (value < 0) return "text-warning";
  return "text-muted-foreground";
}

export function PaceCards({ paceMetrics }: PaceCardsProps) {
  const {
    avg7Day,
    avg30Day,
    avg90Day,
    thisMonthStitches,
    lastMonthStitches,
    stitchRate,
    stitchRatePrior,
  } = paceMetrics;

  const momPercentage = getMoMPercentage(thisMonthStitches, lastMonthStitches);

  const stitchRateTrend =
    stitchRate !== null && stitchRatePrior !== null
      ? getMoMPercentage(stitchRate, stitchRatePrior)
      : null;

  return (
    <div className="bg-success-muted border-success-border grid grid-cols-2 rounded-xl border sm:grid-cols-3 lg:flex lg:flex-row">
      <div className="flex items-center lg:flex-1">
        <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1.5">
            <Activity className="text-success h-4 w-4" />
            <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
              7-DAY AVG
            </span>
          </div>
          <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
            {avg7Day.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">stitches/day</span>
        </div>
        <div className="bg-success-border my-2 hidden w-px self-stretch lg:block" />
      </div>

      <div className="flex items-center lg:flex-1">
        <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1.5">
            <BarChart3 className="text-success h-4 w-4" />
            <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
              30-DAY AVG
            </span>
          </div>
          <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
            {avg30Day.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">stitches/day</span>
        </div>
        <div className="bg-success-border my-2 hidden w-px self-stretch lg:block" />
      </div>

      <div className="flex items-center lg:flex-1">
        <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="text-success h-4 w-4" />
            <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
              90-DAY AVG
            </span>
          </div>
          <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
            {avg90Day.toLocaleString()}
          </span>
          <span className="text-muted-foreground text-xs">stitches/day</span>
        </div>
        <div className="bg-success-border my-2 hidden w-px self-stretch lg:block" />
      </div>

      <div className="flex items-center lg:flex-1">
        <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1.5">
            {momPercentage > 0 && <TrendingUp className="text-success h-4 w-4" />}
            {momPercentage < 0 && <TrendingDown className="text-warning h-4 w-4" />}
            <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
              VS LAST MONTH
            </span>
          </div>
          <span
            className={`font-mono text-3xl font-semibold tabular-nums ${getTrendColor(momPercentage)}`}
          >
            {momPercentage > 0 ? `+${momPercentage}%` : `${momPercentage}%`}
          </span>
        </div>
        <div className="bg-success-border my-2 hidden w-px self-stretch lg:block" />
      </div>

      <div className="flex items-center lg:flex-1">
        <div className="flex w-full flex-col items-center gap-1 px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex items-center gap-1.5">
            {stitchRateTrend !== null && stitchRateTrend > 0 && (
              <TrendingUp className="text-success h-4 w-4" />
            )}
            {stitchRateTrend !== null && stitchRateTrend < 0 && (
              <TrendingDown className="text-warning h-4 w-4" />
            )}
            <span className="text-success-muted-foreground text-xs font-semibold tracking-wider uppercase">
              STITCH RATE
            </span>
          </div>
          <span className="text-foreground font-mono text-3xl font-semibold tabular-nums">
            {stitchRate !== null ? stitchRate.toLocaleString() : "--"}
          </span>
          {stitchRate !== null && (
            <span className="text-muted-foreground text-xs">stitches/hr</span>
          )}
        </div>
      </div>
    </div>
  );
}
