import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BuriedTreasure } from "@/types/dashboard";
import { CoverPlaceholder } from "@/components/features/gallery/cover-placeholder";
import { SectionHeading } from "./section-heading";

interface BuriedTreasuresSectionProps {
  treasures: BuriedTreasure[];
  imageUrls: Record<string, string>;
}

/**
 * Format age for display. < 30 days -> "X days", < 365 days -> "X months", else "X years".
 */
function formatAge(days: number): string {
  if (days < 30) return `${days} days`;
  if (days < 365) return `${Math.floor(days / 30)} months`;
  return `${Math.floor(days / 365)} years`;
}

/**
 * Numbered list of the oldest unstarted charts in the library.
 * Server component -- no "use client" needed.
 * Returns null when the treasures array is empty (section hidden per UI-SPEC).
 */
export function BuriedTreasuresSection({ treasures, imageUrls }: BuriedTreasuresSectionProps) {
  if (treasures.length === 0) return null;

  return (
    <div className="flex flex-col gap-4">
      <SectionHeading title="Buried Treasures" />
      <p className="text-muted-foreground -mt-1 text-sm">
        Your longest-waiting unstarted projects — give them some love!
      </p>

      <div className="flex flex-col gap-3">
        {treasures.map((t, i) => {
          const imgUrl = imageUrls[t.coverThumbnailUrl ?? ""] ?? null;
          const linkHref = t.projectId ? `/charts/${t.chartId}` : `/charts/${t.chartId}`;

          return (
            <Link
              key={t.chartId}
              href={linkHref}
              className="group border-border bg-card hover:border-muted-foreground/20 flex items-center gap-4 rounded-xl border px-4 py-3.5 transition-all duration-200 hover:shadow-sm"
            >
              {/* Index number */}
              <div className="text-muted-foreground/40 w-7 shrink-0 text-center font-mono text-lg font-bold tabular-nums">
                {i + 1}
              </div>

              {/* Thumbnail */}
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg">
                {imgUrl ? (
                  <img src={imgUrl} alt={t.chartName} className="h-full w-full object-cover" />
                ) : (
                  <CoverPlaceholder status="UNSTARTED" />
                )}
              </div>

              {/* Name + designer */}
              <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                <p className="font-heading text-foreground truncate text-sm font-semibold transition-colors group-hover:text-emerald-700 dark:group-hover:text-emerald-400">
                  {t.chartName}
                </p>
                <p className="text-muted-foreground truncate text-xs">{t.designerName}</p>
              </div>

              {/* Age badge - hidden on mobile */}
              <div className="flex shrink-0 flex-col items-end gap-0.5 text-right max-md:hidden">
                <span className="text-muted-foreground font-mono text-sm font-bold tabular-nums">
                  {t.daysInLibrary.toLocaleString()}
                </span>
                <span className="text-muted-foreground/70 text-[10px]">
                  {formatAge(t.daysInLibrary)} in library
                </span>
              </div>

              {/* Genre tags - hidden on smaller screens */}
              <div className="flex shrink-0 gap-1 max-lg:hidden">
                {t.genres.slice(0, 2).map((g) => (
                  <span
                    key={g}
                    className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px]"
                  >
                    {g}
                  </span>
                ))}
              </div>

              {/* Chevron */}
              <ChevronRight
                className="text-muted-foreground/30 group-hover:text-muted-foreground h-4 w-4 shrink-0 transition-colors"
                strokeWidth={1.5}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
