"use client";

import { useState, useTransition } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { monthlyBarConfig } from "@/lib/chart-configs";
import { fetchDailyBreakdown, fetchMonthlyTotals } from "@/lib/actions/stats-actions";
import { MonthlyDrillDown } from "./monthly-drill-down";
import type { MonthlyTotal, DailyBreakdownEntry } from "@/types/stats";

interface MonthlyStitchChartProps {
  data: MonthlyTotal[];
  initialYear: number;
}

const MONTH_LABELS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function MonthlyStitchChart({ data, initialYear }: MonthlyStitchChartProps) {
  const [year, setYear] = useState(initialYear);
  const [chartData, setChartData] = useState<MonthlyTotal[]>(data);
  const [activeMonth, setActiveMonth] = useState<number | null>(null);
  const [drillDownData, setDrillDownData] = useState<DailyBreakdownEntry[]>([]);
  const [isPending, startTransition] = useTransition();

  const isEmpty = chartData.every((item) => item.totalStitches === 0);

  function handlePrevYear() {
    const newYear = year - 1;
    startTransition(async () => {
      const newData = await fetchMonthlyTotals(newYear);
      setYear(newYear);
      setChartData(newData);
      setActiveMonth(null);
      setDrillDownData([]);
    });
  }

  function handleNextYear() {
    const newYear = year + 1;
    startTransition(async () => {
      const newData = await fetchMonthlyTotals(newYear);
      setYear(newYear);
      setChartData(newData);
      setActiveMonth(null);
      setDrillDownData([]);
    });
  }

  function handleBarClick(data: MonthlyTotal, index: number) {
    if (data.totalStitches === 0) return;

    if (index === activeMonth) {
      setActiveMonth(null);
      setDrillDownData([]);
      return;
    }

    setActiveMonth(index);
    startTransition(async () => {
      const breakdown = await fetchDailyBreakdown(index + 1, year);
      setDrillDownData(breakdown);
    });
  }

  const activeTotalStitches =
    activeMonth !== null ? chartData[activeMonth]?.totalStitches ?? 0 : 0;
  const activeMonthLabel = activeMonth !== null ? MONTH_LABELS[activeMonth] : "";

  return (
    <div>
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous year"
          onClick={handlePrevYear}
          disabled={isPending}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-heading text-sm font-semibold">
          Monthly Stitches &mdash; {year}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next year"
          onClick={handleNextYear}
          disabled={isPending}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {isEmpty ? (
        <div className="text-muted-foreground flex h-[250px] items-center justify-center">
          No stitching data for {year}
        </div>
      ) : (
        <ChartContainer config={monthlyBarConfig} className="h-[250px] w-full">
          <BarChart data={chartData} accessibilityLayer>
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis type="number" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="totalStitches"
              radius={4}
              onClick={(data: MonthlyTotal, index: number) => handleBarClick(data, index)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={
                    index === activeMonth
                      ? "var(--chart-1)"
                      : "hsl(var(--chart-1) / 0.6)"
                  }
                  cursor={entry.totalStitches > 0 ? "pointer" : "default"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      )}

      <MonthlyDrillDown
        entries={drillDownData}
        isExpanded={activeMonth !== null}
        monthLabel={activeMonthLabel}
        year={year}
        totalStitches={activeTotalStitches}
      />
    </div>
  );
}
