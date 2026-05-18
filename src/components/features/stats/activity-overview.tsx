import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { PaceCards } from "./pace-cards";
import { MonthlyStitchChart } from "./monthly-stitch-chart";
import { DayOfWeekChart } from "./day-of-week-chart";
import { StitchingCalendar } from "./stitching-calendar";
import { SessionHistoryTable } from "./session-history-table";
import type {
  MonthlyTotal,
  CalendarDayData,
  SessionHistoryData,
  PaceMetricsData,
  DayOfWeekData,
} from "@/types/stats";

interface ActivityOverviewProps {
  paceMetrics: PaceMetricsData;
  monthlyTotals: MonthlyTotal[];
  dayOfWeekData: DayOfWeekData[];
  calendarData: CalendarDayData[];
  sessionHistory: SessionHistoryData;
  projects: { id: string; name: string }[];
  currentYear: number;
  currentMonth: number;
  hasNoSessions: boolean;
}

export function ActivityOverview({
  paceMetrics,
  monthlyTotals,
  dayOfWeekData,
  calendarData,
  sessionHistory,
  projects,
  currentYear,
  currentMonth,
  hasNoSessions,
}: ActivityOverviewProps) {
  if (hasNoSessions) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold">No sessions logged yet</p>
        <p className="text-sm">
          Log your first stitching session to see activity trends, calendar views, and pace metrics
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. PaceCards -- full width, no Card wrapper (self-contained like MetricsBar) */}
      <PaceCards paceMetrics={paceMetrics} />

      {/* 2. Monthly Stitches -- Card wrapper, chart handles its own heading */}
      <Card>
        <CardContent className="pt-6">
          <MonthlyStitchChart data={monthlyTotals} initialYear={currentYear} />
        </CardContent>
      </Card>

      {/* 3. Day of Week -- Card wrapper with heading */}
      <Card>
        <CardHeader>
          <h3 className="font-heading text-sm font-semibold">Stitching Patterns by Day</h3>
        </CardHeader>
        <CardContent>
          <DayOfWeekChart data={dayOfWeekData} />
        </CardContent>
      </Card>

      {/* 4. Calendar -- Card wrapper, calendar handles its own heading */}
      <Card>
        <CardContent className="pt-6">
          <StitchingCalendar
            data={calendarData}
            initialMonth={currentMonth}
            initialYear={currentYear}
          />
        </CardContent>
      </Card>

      {/* 5. Session History -- Card wrapper with heading */}
      <Card>
        <CardHeader>
          <h3 className="font-heading text-sm font-semibold">Session History</h3>
        </CardHeader>
        <CardContent>
          <SessionHistoryTable data={sessionHistory} projects={projects} />
        </CardContent>
      </Card>
    </div>
  );
}
