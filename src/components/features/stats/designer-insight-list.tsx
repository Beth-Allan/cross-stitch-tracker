import Link from "next/link";
import { Users } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import type { DesignerInsight } from "@/types/stats";

interface DesignerInsightListProps {
  items: DesignerInsight[];
}

export function DesignerInsightList({ items }: DesignerInsightListProps) {
  return (
    <Card>
      <CardHeader>
        <h3 className="font-heading flex items-center gap-2 text-sm font-semibold">
          <Users className="text-primary h-4 w-4" />
          Designer Completion
        </h3>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-muted-foreground py-4 text-sm">No supply data yet</p>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <div key={item.designerId} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-5 font-mono text-xs tabular-nums">
                    {index + 1}.
                  </span>
                  <Link
                    href={`/designers/${item.designerId}`}
                    className="text-foreground hover:text-primary decoration-border hover:decoration-primary text-sm underline underline-offset-2 transition-colors"
                  >
                    {item.name}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-foreground text-sm font-semibold">
                    {Math.round(item.completionRate)}%
                  </span>
                  <span className="text-muted-foreground text-xs">
                    ({item.completedProjects}/{item.totalProjects})
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
