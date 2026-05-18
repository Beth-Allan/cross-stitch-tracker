"use client";

import { BarChart, Bar, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { dayOfWeekConfig } from "@/lib/chart-configs";
import type { DayOfWeekData } from "@/types/stats";

interface DayOfWeekChartProps {
  data: DayOfWeekData[];
}

export function DayOfWeekChart({ data }: DayOfWeekChartProps) {
  const isEmpty = data.reduce((sum, item) => sum + item.avgStitches, 0) === 0;

  if (isEmpty) {
    return (
      <div className="text-muted-foreground flex h-[200px] items-center justify-center">
        No stitching data yet
      </div>
    );
  }

  return (
    <ChartContainer config={dayOfWeekConfig} className="h-[200px] w-full">
      <BarChart data={data} accessibilityLayer>
        <XAxis dataKey="dayOfWeek" tickLine={false} axisLine={false} />
        <YAxis type="number" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="avgStitches" fill="var(--chart-1)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}
