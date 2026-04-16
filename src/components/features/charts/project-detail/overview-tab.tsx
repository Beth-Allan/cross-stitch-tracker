import Link from "next/link";
import {
  Scissors,
  BookOpen,
  Calendar,
  Settings,
  CheckCircle,
  ClipboardList,
  Check,
  X,
} from "lucide-react";
import { InfoCard } from "@/components/features/charts/info-card";
import { DetailRow } from "@/components/features/charts/detail-row";
import { ProgressBar } from "@/components/features/charts/progress-bar";
import { getEffectiveStitchCount } from "@/lib/utils/size-category";
import { formatNumber, formatDate } from "@/components/features/gallery/gallery-format";
import { SECTION_ORDER, type OverviewSection } from "./types";
import type { ProjectDetailProps } from "./types";

/** Format a date-only value (YYYY-MM-DD stored as midnight UTC) without timezone shift. */
function formatDateOnly(date: Date | null | undefined): string {
  if (!date) return "-";
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface OverviewTabProps {
  chart: ProjectDetailProps["chart"];
  supplies: ProjectDetailProps["supplies"];
}

export function OverviewTab({ chart, supplies }: OverviewTabProps) {
  const project = chart.project;

  if (!project) {
    return (
      <div className="text-muted-foreground py-8 text-center">No project linked to this chart.</div>
    );
  }

  const { count: effectiveStitchCount, approximate } = getEffectiveStitchCount(
    chart.stitchCount ?? 0,
    chart.stitchesWide ?? 0,
    chart.stitchesHigh ?? 0,
  );

  const sectionOrder = SECTION_ORDER[project.status];

  const supplyCount = supplies
    ? supplies.threads.length + supplies.beads.length + supplies.specialty.length
    : 0;

  const sectionRenderers: Record<OverviewSection, () => React.ReactNode> = {
    progress: () => (
      <InfoCard key="progress" icon={Scissors} title="Stitching Progress">
        <div className="space-y-1">
          <ProgressBar
            value={project.stitchesCompleted}
            max={effectiveStitchCount}
            className="mb-4"
          />
          <DetailRow
            label="Completed"
            value={`${formatNumber(project.stitchesCompleted)} stitches`}
          />
          <DetailRow
            label="Remaining"
            value={`${formatNumber(Math.max(0, effectiveStitchCount - project.stitchesCompleted))} stitches`}
          />
          {project.startingStitches > 0 && (
            <DetailRow label="Starting Stitches" value={formatNumber(project.startingStitches)} />
          )}
        </div>
      </InfoCard>
    ),

    kitting: () => (
      <InfoCard key="kitting" icon={ClipboardList} title="Kitting Checklist">
        <div className="space-y-2">
          <KittingItem
            label="Fabric"
            ready={!!project.fabric}
            detail={
              project.fabric
                ? `${project.fabric.name} - ${project.fabric.count}ct (${project.fabric.brand.name})`
                : "Not assigned"
            }
          />
          <KittingItem
            label="Digital Copy"
            ready={!!chart.digitalWorkingCopyUrl}
            detail={chart.digitalWorkingCopyUrl ? "Ready" : "Not uploaded"}
          />
          <KittingItem
            label="Supplies"
            ready={supplyCount > 0}
            detail={
              supplyCount > 0
                ? `${supplyCount} item${supplyCount !== 1 ? "s" : ""} linked`
                : "None added"
            }
          />
        </div>
      </InfoCard>
    ),

    completion: () => (
      <InfoCard key="completion" icon={CheckCircle} title="Completion">
        <div>
          <DetailRow
            label="Total Stitches"
            value={`${formatNumber(effectiveStitchCount)} stitches`}
          />
          {project.finishDate && (
            <DetailRow label="Finished" value={formatDateOnly(project.finishDate)} />
          )}
          {project.ffoDate && <DetailRow label="FFO" value={formatDateOnly(project.ffoDate)} />}
          {project.startDate && project.finishDate && (
            <DetailRow
              label="Duration"
              value={formatDuration(project.startDate, project.finishDate)}
            />
          )}
        </div>
      </InfoCard>
    ),

    patternDetails: () => (
      <InfoCard key="patternDetails" icon={BookOpen} title="Pattern Details">
        <div>
          {effectiveStitchCount > 0 && (
            <DetailRow
              label="Stitch Count"
              value={`${approximate ? "~" : ""}${formatNumber(effectiveStitchCount)}${approximate ? " (est.)" : ""}`}
            />
          )}
          {chart.stitchesWide && chart.stitchesHigh && (
            <DetailRow
              label="Dimensions"
              value={`${chart.stitchesWide}w \u00D7 ${chart.stitchesHigh}h`}
            />
          )}
          {chart.designer && (
            <DetailRow
              label="Designer"
              value={
                <Link
                  href={`/designers/${chart.designer.id}`}
                  className="text-primary hover:underline"
                >
                  {chart.designer.name}
                </Link>
              }
            />
          )}
          {chart.genres.length > 0 && (
            <DetailRow label="Genres" value={chart.genres.map((g) => g.name).join(", ")} />
          )}
        </div>
      </InfoCard>
    ),

    dates: () => (
      <InfoCard key="dates" icon={Calendar} title="Dates">
        <div>
          <DetailRow label="Added" value={formatDate(chart.dateAdded)} />
          {project.startDate && (
            <DetailRow label="Started" value={formatDateOnly(project.startDate)} />
          )}
          {project.finishDate && (
            <DetailRow label="Finished" value={formatDateOnly(project.finishDate)} />
          )}
          {project.ffoDate && <DetailRow label="FFO" value={formatDateOnly(project.ffoDate)} />}
        </div>
      </InfoCard>
    ),

    projectSetup: () => (
      <InfoCard key="projectSetup" icon={Settings} title="Project Setup">
        <div>
          {project.fabric && (
            <DetailRow
              label="Fabric"
              value={`${project.fabric.name} - ${project.fabric.count}ct (${project.fabric.brand.name})`}
            />
          )}
          {project.storageLocation && (
            <DetailRow label="Storage Location" value={project.storageLocation.name} />
          )}
          {project.stitchingApp && (
            <DetailRow label="Stitching App" value={project.stitchingApp.name} />
          )}
        </div>
      </InfoCard>
    ),
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {sectionOrder.map((section) => sectionRenderers[section]())}
    </div>
  );
}

// ─── Helper Components ─────────────────────────────────────────────────────

function KittingItem({ label, ready, detail }: { label: string; ready: boolean; detail: string }) {
  return (
    <div className="flex items-center gap-2">
      {ready ? (
        <Check className="text-success h-4 w-4" />
      ) : (
        <X className="text-muted-foreground h-4 w-4" />
      )}
      <span className="text-sm font-medium">{label}</span>
      <span className="text-muted-foreground text-sm">{detail}</span>
    </div>
  );
}

function formatDuration(start: Date, end: Date): string {
  const startDate = start instanceof Date ? start : new Date(start);
  const endDate = end instanceof Date ? end : new Date(end);
  const days = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""}`;
  const months = Math.round(days / 30);
  return `${months} month${months !== 1 ? "s" : ""}`;
}
