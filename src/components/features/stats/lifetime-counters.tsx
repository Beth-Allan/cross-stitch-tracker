import { FolderOpen } from "lucide-react";
import { formatTime } from "@/lib/utils/format-time";

interface LifetimeCountersProps {
  collectionTotalStitches: number;
  totalSessions: number;
  totalTimeMinutes: number;
  projectsCompleted: number;
}

const COUNTER_CARDS = [
  { key: "collectionTotalStitches" as const, label: "COLLECTION TOTAL", format: "number" as const },
  { key: "totalSessions" as const, label: "SESSIONS", format: "number" as const },
  { key: "totalTimeMinutes" as const, label: "TIME STITCHING", format: "time" as const },
  { key: "projectsCompleted" as const, label: "COMPLETED", format: "number" as const },
];

export function LifetimeCounters(props: LifetimeCountersProps) {
  return (
    <div>
      <div className="mb-4 flex items-center gap-2">
        <FolderOpen className="text-success h-4 w-4" />
        <h3 className="font-heading text-sm font-semibold">Lifetime</h3>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {COUNTER_CARDS.map((card) => {
          const value = props[card.key];
          const formatted = card.format === "time" ? formatTime(value) : value.toLocaleString();

          return (
            <div key={card.key} className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
              <p className="text-muted-foreground text-xs tracking-wider uppercase">{card.label}</p>
              <p className="text-foreground mt-1 font-mono text-lg font-semibold tabular-nums">
                {formatted}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
