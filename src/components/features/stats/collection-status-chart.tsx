"use client";

import { PieChart, Pie, Cell, Label } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { collectionStatusConfig } from "@/lib/chart-configs";
import type { StatusBreakdownItem } from "@/types/stats";

interface CollectionStatusChartProps {
  data: StatusBreakdownItem[];
  totalProjects: number;
}

export function CollectionStatusChart({ data, totalProjects }: CollectionStatusChartProps) {
  if (totalProjects === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center text-muted-foreground">
        No projects yet
      </div>
    );
  }

  // Only render slices with count > 0
  const chartData = data.filter((item) => item.count > 0);

  return (
    <ChartContainer
      config={collectionStatusConfig}
      className="mx-auto h-[250px] w-full max-w-[250px]"
    >
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent />} />
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="status"
          innerRadius={60}
          outerRadius={90}
          strokeWidth={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.status} fill={entry.fill} />
          ))}
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text
                    x={viewBox.cx}
                    y={viewBox.cy}
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-3xl font-bold"
                    >
                      {totalProjects}
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy ?? 0) + 24}
                      className="fill-muted-foreground text-sm"
                    >
                      Projects
                    </tspan>
                  </text>
                );
              }
              return null;
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
