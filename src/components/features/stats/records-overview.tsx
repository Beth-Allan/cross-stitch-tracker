import { Card, CardContent } from "@/components/ui/card";
import { YearScopeToggle } from "./year-scope-toggle";
import { RecordsTable } from "./records-table";
import { ThreadInsightList } from "./thread-insight-list";
import { DesignerInsightList } from "./designer-insight-list";
import { GenreInsightList } from "./genre-insight-list";
import { CompletionEstimatesSection } from "./completion-estimates-section";
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
          <RecordsTable personalBests={personalBests} fastestCompletions={fastestCompletions} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <ThreadInsightList items={threadInsights} />
        <DesignerInsightList items={designerInsights} />
        <GenreInsightList items={genreInsights} />
      </div>

      <CompletionEstimatesSection items={completionEstimates} />
    </div>
  );
}
