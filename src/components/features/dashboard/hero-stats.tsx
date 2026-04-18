import type { HeroStatsData } from "@/types/dashboard";

interface HeroStatsProps {
  stats: HeroStatsData;
}

const STAT_ITEMS = [
  { key: "totalWIPs", label: "Total WIPs" },
  { key: "averageProgress", label: "Avg. Progress" },
  { key: "closestToCompletion", label: "Closest to Done" },
  { key: "finishedThisYear", label: "Finished This Year" },
  { key: "finishedAllTime", label: "Finished All Time" },
  { key: "totalStitches", label: "Total Stitches" },
] as const;

function formatStatValue(key: string, stats: HeroStatsData): string {
  switch (key) {
    case "totalWIPs":
      return String(stats.totalWIPs);
    case "averageProgress":
      return `${stats.averageProgress}%`;
    case "closestToCompletion":
      return stats.closestToCompletion?.name ?? "\u2014";
    case "finishedThisYear":
      return String(stats.finishedThisYear);
    case "finishedAllTime":
      return String(stats.finishedAllTime);
    case "totalStitches":
      return stats.totalStitchesAllProjects.toLocaleString();
    default:
      return "";
  }
}

function formatStatSubtitle(key: string, stats: HeroStatsData): string | null {
  if (key === "closestToCompletion" && stats.closestToCompletion) {
    return `${stats.closestToCompletion.percent}%`;
  }
  return null;
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4">
      {STAT_ITEMS.map(({ key, label }) => {
        const value = formatStatValue(key, stats);
        const subtitle = formatStatSubtitle(key, stats);

        return (
          <div
            key={key}
            className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20"
          >
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {label}
            </p>
            <p className="font-mono text-xl font-bold tabular-nums">{value}</p>
            {subtitle && (
              <p className="font-mono text-sm tabular-nums text-muted-foreground">{subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
