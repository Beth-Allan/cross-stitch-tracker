"use client";

import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { sizeCategoryConfig } from "@/lib/chart-configs";
import type { SizeBreakdownItem } from "@/types/stats";

interface SizeCategoryChartProps {
  data: SizeBreakdownItem[];
}

export function SizeCategoryChart({ data }: SizeCategoryChartProps) {
  const isEmpty = data.reduce((sum, item) => sum + item.count, 0) === 0;

  if (isEmpty) {
    return (
      <div className="text-muted-foreground flex h-[250px] items-center justify-center">
        No projects yet
      </div>
    );
  }

  return (
    <ChartContainer config={sizeCategoryConfig} className="h-[250px] w-full">
      <BarChart data={data} accessibilityLayer>
        <XAxis dataKey="category" tickLine={false} axisLine={false} />
        <YAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="count" radius={4}>
          {data.map((entry) => (
            <Cell key={entry.category} fill={entry.fill} />
          ))}
        </Bar>
      </BarChart>
    </ChartContainer>
  );
}
