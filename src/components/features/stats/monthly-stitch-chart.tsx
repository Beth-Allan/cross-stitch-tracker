"use client";

import { useState, useEffect, useTransition } from "react";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
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

  useEffect(() => {
    setChartData(data);
    setYear(initialYear);
    setActiveMonth(null);
    setDrillDownData([]);
  }, [data, initialYear]);

  const isEmpty = chartData.every((item) => item.totalStitches === 0);

  function handlePrevYear() {
    const newYear = year - 1;
    startTransition(async () => {
      try {
        const result = await fetchMonthlyTotals(newYear);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setYear(newYear);
        setChartData(result.data);
        setActiveMonth(null);
        setDrillDownData([]);
      } catch (error) {
        console.error("Load monthly chart data failed:", error);
        toast.error("Something went wrong loading chart data.");
      }
    });
  }

  function handleNextYear() {
    const newYear = year + 1;
    startTransition(async () => {
      try {
        const result = await fetchMonthlyTotals(newYear);
        if (!result.success) {
          toast.error(result.error);
          return;
        }
        setYear(newYear);
        setChartData(result.data);
        setActiveMonth(null);
        setDrillDownData([]);
      } catch (error) {
        console.error("Load monthly chart data failed:", error);
        toast.error("Something went wrong loading chart data.");
      }
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
      try {
        const result = await fetchDailyBreakdown(index + 1, year);
        if (!result.success) {
          toast.error(result.error);
          setActiveMonth(null);
          return;
        }
        setDrillDownData(result.data);
      } catch (error) {
        console.error("Load daily breakdown failed:", error);
        toast.error("Something went wrong loading breakdown.");
        setActiveMonth(null);
      }
    });
  }

  const activeTotalStitches =
    activeMonth !== null ? (chartData[activeMonth]?.totalStitches ?? 0) : 0;
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
        <h3 className="font-heading text-sm font-semibold">Monthly Stitches &mdash; {year}</h3>
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
              onClick={(barData) => {
                const entry = barData.payload as MonthlyTotal;
                const monthIndex = chartData.findIndex((d) => d.month === entry.month);
                if (monthIndex >= 0) handleBarClick(entry, monthIndex);
              }}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={entry.month}
                  fill={
                    activeMonth === null || index === activeMonth
                      ? "var(--chart-1)"
                      : "color-mix(in oklch, var(--chart-1) 60%, transparent)"
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
        isLoading={isPending && activeMonth !== null}
        monthLabel={activeMonthLabel}
        year={year}
        totalStitches={activeTotalStitches}
      />
    </div>
  );
}
