import { Card, CardContent } from "@/components/ui/card";
import { YearScopeToggle } from "./year-scope-toggle";
import { RecordsTable } from "./records-table";
import { ThreadInsightList } from "./thread-insight-list";
import { DesignerInsightList } from "./designer-insight-list";
import { GenreInsightList } from "./genre-insight-list";
import { CompletionEstimatesSection } from "./completion-estimates-section";
import { DataUnavailable } from "./data-unavailable";
import type {
  PersonalBestRecord,
  FastestCompletion,
  ThreadInsight,
  DesignerInsight,
  GenreInsight,
  CompletionEstimate,
} from "@/types/stats";

interface RecordsOverviewProps {
  personalBests: PersonalBestRecord[] | null;
  fastestCompletions: FastestCompletion[] | null;
  threadInsights: ThreadInsight[] | null;
  designerInsights: DesignerInsight[] | null;
  genreInsights: GenreInsight[] | null;
  completionEstimates: CompletionEstimate[] | null;
  availableYears: number[] | null;
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
      {availableYears !== null ? (
        <div className="mb-4 flex justify-end">
          <YearScopeToggle availableYears={availableYears} />
        </div>
      ) : (
        <DataUnavailable label="Year filter" />
      )}

      {personalBests !== null && fastestCompletions !== null ? (
        <Card>
          <CardContent className="pt-6">
            <RecordsTable personalBests={personalBests} fastestCompletions={fastestCompletions} />
          </CardContent>
        </Card>
      ) : (
        <DataUnavailable label="Personal records" />
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {threadInsights !== null ? (
          <ThreadInsightList items={threadInsights} />
        ) : (
          <DataUnavailable label="Thread insights" />
        )}
        {designerInsights !== null ? (
          <DesignerInsightList items={designerInsights} />
        ) : (
          <DataUnavailable label="Designer insights" />
        )}
        {genreInsights !== null ? (
          <GenreInsightList items={genreInsights} />
        ) : (
          <DataUnavailable label="Genre insights" />
        )}
      </div>

      {completionEstimates !== null ? (
        <CompletionEstimatesSection items={completionEstimates} />
      ) : (
        <DataUnavailable label="Completion estimates" />
      )}
    </div>
  );
}
