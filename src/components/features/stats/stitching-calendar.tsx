"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getDaysInMonth, getDay, startOfMonth, format, isToday } from "date-fns";
import { fetchCalendarMonth } from "@/lib/actions/stats-actions";
import type { CalendarDayData } from "@/types/stats";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const CHART_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
] as const;

function getProjectColorMap(data: CalendarDayData[]): Map<string, number> {
  const projectIds = new Set<string>();
  for (const day of data) {
    for (const session of day.sessions) {
      projectIds.add(session.projectId);
    }
  }
  const sorted = [...projectIds].sort();
  return new Map(sorted.map((id, i) => [id, i % CHART_COLORS.length]));
}

function getProjectNameMap(data: CalendarDayData[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const day of data) {
    for (const session of day.sessions) {
      if (!map.has(session.projectId)) {
        map.set(session.projectId, session.projectName);
      }
    }
  }
  return map;
}

interface StitchingCalendarProps {
  data: CalendarDayData[];
  initialMonth: number; // 1-based
  initialYear: number;
}

export function StitchingCalendar({ data, initialMonth, initialYear }: StitchingCalendarProps) {
  const [month, setMonth] = useState(initialMonth);
  const [year, setYear] = useState(initialYear);
  const [calendarData, setCalendarData] = useState<CalendarDayData[]>(data);
  const [isPending, startTransition] = useTransition();

  const projectColorMap = useMemo(() => getProjectColorMap(calendarData), [calendarData]);
  const projectNameMap = useMemo(() => getProjectNameMap(calendarData), [calendarData]);

  const dayLookup = useMemo(() => {
    const map = new Map<string, CalendarDayData>();
    for (const day of calendarData) {
      map.set(day.date, day);
    }
    return map;
  }, [calendarData]);

  // Calendar grid calculations
  const daysInMonth = getDaysInMonth(new Date(year, month - 1));
  const firstDayOfWeek = getDay(startOfMonth(new Date(year, month - 1)));
  // Convert from Sun=0 to Mon=0 start: (firstDayOfWeek + 6) % 7
  const startPadding = (firstDayOfWeek + 6) % 7;

  const calendarCells: (number | null)[] = useMemo(() => {
    const cells: (number | null)[] = [];
    for (let i = 0; i < startPadding; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    // Fill remaining cells to complete the last row
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [startPadding, daysInMonth]);

  function navigateMonth(delta: number) {
    let newMonth = month + delta;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear--;
    }
    if (newMonth > 12) {
      newMonth = 1;
      newYear++;
    }
    setMonth(newMonth);
    setYear(newYear);
    startTransition(async () => {
      const result = await fetchCalendarMonth(newMonth, newYear);
      setCalendarData(result);
    });
  }

  const monthLabel = format(new Date(year, month - 1), "MMMM yyyy");
  const isEmpty = calendarData.length === 0;

  return (
    <div className="border-border bg-card overflow-hidden rounded-xl border">
      {/* Month navigation header */}
      <div className="border-border flex items-center justify-between border-b px-5 py-3">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Previous month"
          onClick={() => navigateMonth(-1)}
          disabled={isPending}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="font-heading text-sm font-semibold">{monthLabel}</h3>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Next month"
          onClick={() => navigateMonth(1)}
          disabled={isPending}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="border-border grid grid-cols-7 border-b">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-muted-foreground py-2 text-center text-[10px] font-semibold tracking-wider uppercase"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className={`grid grid-cols-7 ${isPending ? "opacity-50" : ""}`}>
        {calendarCells.map((dayNum, i) => {
          if (dayNum === null) {
            return (
              <div
                key={`pad-${i}`}
                data-testid="padding-cell"
                className="border-border bg-muted min-h-[48px] border-r border-b sm:min-h-[80px]"
              />
            );
          }

          const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
          const dayData = dayLookup.get(dateStr);
          const isTodayDate = isToday(new Date(year, month - 1, dayNum));

          return (
            <div
              key={dateStr}
              className={`border-border min-h-[48px] border-r border-b p-1 sm:min-h-[80px] sm:p-2 ${
                isTodayDate ? "bg-success-muted" : ""
              }`}
            >
              {/* Day number */}
              <div className="mb-1">
                {isTodayDate ? (
                  <span
                    data-testid="today-indicator"
                    className="bg-success inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-medium text-white"
                  >
                    {dayNum}
                  </span>
                ) : (
                  <span className="text-muted-foreground text-xs tabular-nums">{dayNum}</span>
                )}
              </div>

              {/* Session pills - full on sm+, dots on mobile */}
              {dayData?.sessions.map((session, si) => {
                const colorIndex = projectColorMap.get(session.projectId) ?? 0;
                return (
                  <Link
                    key={si}
                    href={`/projects/${session.projectId}`}
                    className="mb-0.5 hidden truncate rounded border px-1 py-0.5 text-[10px] leading-tight font-semibold sm:block"
                    style={{
                      backgroundColor: `color-mix(in oklch, var(--chart-${colorIndex + 1}) 15%, transparent)`,
                      borderColor: `color-mix(in oklch, var(--chart-${colorIndex + 1}) 40%, transparent)`,
                      color: `var(--chart-${colorIndex + 1})`,
                    }}
                  >
                    {session.projectName} {session.stitchCount.toLocaleString()}
                  </Link>
                );
              })}

              {/* Mobile dots */}
              {dayData?.sessions && dayData.sessions.length > 0 && (
                <div className="flex gap-0.5 sm:hidden">
                  {dayData.sessions.map((session, si) => {
                    const colorIndex = projectColorMap.get(session.projectId) ?? 0;
                    return (
                      <div
                        key={si}
                        className="h-1 w-1 rounded-full"
                        style={{
                          backgroundColor: `var(--chart-${colorIndex + 1})`,
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="text-muted-foreground py-8 text-center text-sm">No sessions this month</div>
      )}

      {/* Calendar legend */}
      {!isEmpty && (
        <div
          data-testid="calendar-legend"
          className="border-border hidden flex-wrap gap-3 border-t px-5 py-3 sm:flex"
        >
          {[...projectColorMap.entries()].map(([projectId, colorIndex]) => (
            <div key={projectId} className="flex items-center gap-1.5">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: `var(--chart-${colorIndex + 1})`,
                }}
              />
              <span className="text-muted-foreground text-xs">
                {projectNameMap.get(projectId) ?? projectId}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
