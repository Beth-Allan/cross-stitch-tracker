import { Palette } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { ThreadInsight } from "@/types/stats";

interface ThreadInsightListProps {
  items: ThreadInsight[];
}

export function ThreadInsightList({ items }: ThreadInsightListProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Palette className="text-primary h-4 w-4" />
          Top Thread Colors
        </h3>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">No supply data yet</p>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={item.threadId} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
                    {index + 1}.
                  </span>
                  {item.hexColor ? (
                    <div
                      className="border-border h-4 w-4 shrink-0 rounded-sm border"
                      style={{ backgroundColor: item.hexColor }}
                      aria-hidden="true"
                    />
                  ) : (
                    <div
                      className="bg-muted border-border h-4 w-4 shrink-0 rounded-sm border"
                      aria-hidden="true"
                    />
                  )}
                  <span className="text-foreground text-sm">
                    {item.brandName} {item.colorCode} -- {item.colorName}
                  </span>
                </div>
                <span className="text-muted-foreground font-mono text-xs whitespace-nowrap tabular-nums">
                  {item.projectCount} {item.projectCount === 1 ? "project" : "projects"}
                </span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
