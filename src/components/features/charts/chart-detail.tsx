"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image,
  Pencil,
  Scissors,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ChartWithProject } from "@/types/chart";
import type {
  ProjectThreadWithThread,
  ProjectBeadWithBead,
  ProjectSpecialtyWithItem,
} from "@/types/supply";
import { ProjectSuppliesTab } from "./project-supplies-tab";
import { getEffectiveStitchCount, calculateSizeCategory } from "@/lib/utils/size-category";
import { deleteChart } from "@/lib/actions/chart-actions";
import { getPresignedDownloadUrl } from "@/lib/actions/upload-actions";
import { StatusBadge } from "./status-badge";
import { SizeBadge } from "./size-badge";
import { StatusControl } from "./status-control";
import { InfoCard } from "./info-card";
import { DetailRow } from "./detail-row";
import { ProgressBar } from "./progress-bar";
import { Button } from "@/components/ui/button";
import { LinkButton } from "@/components/ui/link-button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

function formatNumber(n: number): string {
  return new Intl.NumberFormat().format(n);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/** Format a date-only value (YYYY-MM-DD stored as midnight UTC) without timezone shift. */
function formatDateOnly(date: Date | null | undefined): string {
  if (!date) return "-";
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

interface ProjectSuppliesData {
  threads: ProjectThreadWithThread[];
  beads: ProjectBeadWithBead[];
  specialty: ProjectSpecialtyWithItem[];
}

interface ChartDetailProps {
  chart: ChartWithProject;
  projectSupplies?: ProjectSuppliesData | null;
}

export function ChartDetail({ chart, projectSupplies }: ChartDetailProps) {
  const project = chart.project;
  const status = project?.status ?? "UNSTARTED";
  const { count: effectiveStitchCount, approximate } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );
  const sizeCategory =
    effectiveStitchCount > 0 ? calculateSizeCategory(effectiveStitchCount) : null;

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href="/charts"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Charts
      </Link>

      {/* Header section */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Cover image */}
        <CoverImage coverImageUrl={chart.coverImageUrl} chartName={chart.name} />

        {/* Metadata */}
        <div className="flex-1 space-y-3">
          <StatusBadge status={status} size="md" />
          <h1 className="font-heading text-foreground text-2xl font-semibold">{chart.name}</h1>
          {chart.designer && (
            <p className="text-muted-foreground text-sm">Designer: {chart.designer.name}</p>
          )}
          <div className="text-muted-foreground flex flex-wrap items-center gap-3 text-sm">
            {effectiveStitchCount > 0 && (
              <span>
                {approximate && "~"}
                {formatNumber(effectiveStitchCount)} stitches
              </span>
            )}
            {chart.stitchesWide > 0 && chart.stitchesHigh > 0 && (
              <span>
                {chart.stitchesWide}w × {chart.stitchesHigh}h
              </span>
            )}
            {sizeCategory && (
              <SizeBadge
                stitchCount={chart.stitchCount}
                stitchesWide={chart.stitchesWide}
                stitchesHigh={chart.stitchesHigh}
              />
            )}
          </div>
          <p className="text-muted-foreground/70 text-xs">Added {formatDate(chart.dateAdded)}</p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <LinkButton href={`/charts/${chart.id}/edit`} variant="outline">
              <Pencil className="size-4" data-icon="inline-start" />
              Edit
            </LinkButton>
            <DeleteChartDialog chartId={chart.id} chartName={chart.name} />
          </div>
        </div>
      </div>

      {/* Status control */}
      {project && <StatusControl chartId={chart.id} currentStatus={status} />}

      {/* Overview */}
      <OverviewTab chart={chart} />

      {/* Supplies */}
      {project && projectSupplies && (
        <ProjectSuppliesTab
          projectId={project.id}
          threads={projectSupplies.threads}
          beads={projectSupplies.beads}
          specialty={projectSupplies.specialty}
        />
      )}
    </div>
  );
}

/* ---- Cover Image ---- */

function CoverImage({
  coverImageUrl,
  chartName,
}: {
  coverImageUrl: string | null;
  chartName: string;
}) {
  if (coverImageUrl) {
    return (
      <img
        src={coverImageUrl}
        alt={`Cover for ${chartName}`}
        className="max-h-80 w-full rounded-lg object-cover lg:w-80"
      />
    );
  }

  return (
    <div className="bg-muted flex max-h-80 w-full items-center justify-center rounded-lg lg:w-80">
      <div className="flex flex-col items-center gap-2 py-16">
        <Image className="text-muted-foreground/40 h-8 w-8" strokeWidth={1.5} />
        <span className="text-muted-foreground/70 text-xs">No cover image</span>
      </div>
    </div>
  );
}

/* ---- Delete Dialog ---- */

function DeleteChartDialog({ chartId, chartName }: { chartId: string; chartName: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteChart(chartId);
      if (result.success) {
        toast.success("Chart deleted");
        router.push("/charts");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant="destructive" />}>
        <Trash2 className="size-4" data-icon="inline-start" />
        Delete
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Chart</DialogTitle>
          <DialogDescription>
            This will permanently delete {chartName} and all associated project data. This cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} autoFocus>
            Keep Chart
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete Chart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---- Overview Tab ---- */

function OverviewTab({ chart }: { chart: ChartWithProject }) {
  const project = chart.project;
  const { count: effectiveStitchCount } = getEffectiveStitchCount(
    chart.stitchCount,
    chart.stitchesWide,
    chart.stitchesHigh,
  );

  const showProgress =
    project && ["IN_PROGRESS", "ON_HOLD", "FINISHED", "FFO"].includes(project.status);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Stitching Progress */}
      {showProgress && project && (
        <InfoCard icon={Scissors} title="Stitching Progress">
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
      )}

      {/* Pattern Details */}
      <InfoCard icon={FileText} title="Pattern Details" className="lg:col-span-2">
        <div>
          <DetailRow label="Format" value={chart.isPaperChart ? "Paper" : "Digital"} />
          <DetailRow
            label="Kit"
            value={
              chart.isFormalKit
                ? chart.kitColorCount
                  ? `Yes (${chart.kitColorCount} colors)`
                  : "Yes"
                : "No"
            }
          />
          <DetailRow label="SAL" value={chart.isSAL ? "Yes" : "No"} />
          <WorkingCopyRow digitalWorkingCopyUrl={chart.digitalWorkingCopyUrl} />
        </div>
      </InfoCard>

      {/* Project Setup — only show if any field has data */}
      {project && (project.projectBin || project.ipadApp || project.needsOnionSkinning) && (
        <InfoCard icon={Settings} title="Project Setup" className="lg:col-span-2">
          <div>
            {project.projectBin && <DetailRow label="Project Bin" value={project.projectBin} />}
            {project.ipadApp && <DetailRow label="iPad App" value={project.ipadApp} />}
            {project.needsOnionSkinning && <DetailRow label="Onion Skinning" value="Needed" />}
          </div>
        </InfoCard>
      )}

      {/* Dates — always show Added, only show others if set */}
      <InfoCard icon={Calendar} title="Dates" className="lg:col-span-2">
        <div>
          <DetailRow label="Added" value={formatDate(chart.dateAdded)} />
          {project?.startDate && (
            <DetailRow label="Started" value={formatDateOnly(project.startDate)} />
          )}
          {project?.finishDate && (
            <DetailRow label="Finished" value={formatDateOnly(project.finishDate)} />
          )}
          {project?.ffoDate && <DetailRow label="FFO" value={formatDateOnly(project.ffoDate)} />}
        </div>
      </InfoCard>
    </div>
  );
}

/* ---- Working Copy Download ---- */

function WorkingCopyRow({ digitalWorkingCopyUrl }: { digitalWorkingCopyUrl: string | null }) {
  const [isDownloading, setIsDownloading] = useState(false);

  async function handleDownload() {
    if (!digitalWorkingCopyUrl) return;
    setIsDownloading(true);
    try {
      const result = await getPresignedDownloadUrl(digitalWorkingCopyUrl);
      if (result.success) {
        window.open(result.url, "_blank");
      } else {
        toast.error("Could not generate download link.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <DetailRow
      label="Working Copy"
      value={
        digitalWorkingCopyUrl ? (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="text-primary text-sm font-medium underline-offset-2 hover:underline disabled:opacity-50"
          >
            {isDownloading ? "Loading..." : "Download"}
          </button>
        ) : (
          "Not uploaded"
        )
      }
    />
  );
}
