import Link from "next/link";
import { BarChart3 } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { GenreInsight } from "@/types/stats";

interface GenreInsightListProps {
  items: GenreInsight[];
}

export function GenreInsightList({ items }: GenreInsightListProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <BarChart3 className="text-primary h-4 w-4" />
          Most Stitched Genres
        </h3>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">No supply data yet</p>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={item.genreId} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
                    {index + 1}.
                  </span>
                  <Link
                    href={`/genres/${item.genreId}`}
                    className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm underline underline-offset-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                </div>
                <span className="text-muted-foreground whitespace-nowrap font-mono text-xs tabular-nums">
                  {item.totalStitches.toLocaleString()} stitches
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
