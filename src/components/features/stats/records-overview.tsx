import { Card, CardContent } from "@/components/ui/card";
import { RecordsTable } from "./records-table";
import { CompletionEstimatesSection } from "./completion-estimates-section";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import type { PersonalBestRecord, FastestCompletion, CompletionEstimate } from "@/types/stats";

interface RecordsOverviewProps {
  personalBests: PersonalBestRecord[] | null;
  fastestCompletions: FastestCompletion[] | null;
  completionEstimates: CompletionEstimate[] | null;
  totalSessionStitches: number | null;
  hasNoSessions: boolean;
}

export function RecordsOverview({
  personalBests,
  fastestCompletions,
  completionEstimates,
  totalSessionStitches,
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
      {totalSessionStitches !== null ? (
        <div className="bg-card ring-foreground/10 rounded-xl p-4 ring-1">
          <p className="text-muted-foreground text-xs tracking-wider uppercase">STITCHES LOGGED</p>
          <p className="text-foreground mt-1 font-mono text-lg font-semibold tabular-nums">
            {totalSessionStitches.toLocaleString()}
          </p>
        </div>
      ) : (
        <DataUnavailable label="Stitches logged" />
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

      {completionEstimates !== null ? (
        <CompletionEstimatesSection items={completionEstimates} />
      ) : (
        <DataUnavailable label="Completion estimates" />
      )}
    </div>
  );
}
