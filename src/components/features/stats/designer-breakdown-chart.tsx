"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { designerBarConfig } from "@/lib/chart-configs";
import type { DesignerBreakdownItem } from "@/types/stats";

interface DesignerBreakdownChartProps {
  data: DesignerBreakdownItem[];
}

export function DesignerBreakdownChart({ data }: DesignerBreakdownChartProps) {
  if (data.length === 0) {
    return (
      <div className="text-muted-foreground flex h-[300px] items-center justify-center">
        No designers yet
      </div>
    );
  }

  return (
    <ChartContainer config={designerBarConfig} className="h-[300px] w-full">
      <BarChart layout="vertical" data={data} accessibilityLayer>
        <XAxis type="number" tickLine={false} axisLine={false} />
        <YAxis
          type="category"
          dataKey="name"
          width={120}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value: string) =>
            value.length > 20 ? `${value.slice(0, 18)}...` : value
          }
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" fill="var(--chart-1)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
