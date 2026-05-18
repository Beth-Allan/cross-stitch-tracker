import { Card, CardContent } from "@/components/ui/card";
import { YearScopeToggle } from "./year-scope-toggle";
import { RecordsTable } from "./records-table";
import type {
  PersonalBestRecord,
  FastestCompletion,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
  CompletionEstimate,
} from "@/types/stats";

interface RecordsOverviewProps {
  personalBests: PersonalBestRecord[];
  fastestCompletions: FastestCompletion[];
  threadInsights: ThreadInsight[];
  designerInsights: DesignerInsight[];
  genreInsights: GenreInsight[];
  completionEstimates: CompletionEstimate[];
  availableYears: number[];
  hasNoSessions: boolean;
}

export function RecordsOverview({
  personalBests,
  fastestCompletions,
  threadInsights,
  designerInsights,
  genreInsights,
  completionEstimates,
  availableYears,
  hasNoSessions,
}: RecordsOverviewProps) {
  if (hasNoSessions) {
    return (
      <div className="text-muted-foreground flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <p className="text-lg font-semibold">No records yet</p>
        <p className="text-sm">
          Log your first stitching session to start tracking personal bests and records.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="mb-4 flex justify-end">
        <YearScopeToggle availableYears={availableYears} />
      </div>

      <Card>
        <CardContent className="pt-6">
          <RecordsTable
            personalBests={personalBests}
            fastestCompletions={fastestCompletions}
            availableYears={availableYears}
          />
        </CardContent>
      </Card>

      {/* Insights -- Plan 03 */}

      {/* Completion Estimates -- Plan 03 */}
    </div>
  );
}
