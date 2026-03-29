"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  FileText,
  Image,
  Package,
  Pencil,
  Scissors,
  Settings,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import type { ChartWithProject } from "@/types/chart";
import { STATUS_CONFIG } from "@/lib/utils/status";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

interface ChartDetailProps {
  chart: ChartWithProject;
}

export function ChartDetail({ chart }: ChartDetailProps) {
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
        className="inline-flex items-center gap-1.5 text-sm text-stone-500 transition-colors hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-300"
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
          <h1 className="font-heading text-2xl font-semibold text-stone-900 dark:text-stone-100">
            {chart.name}
          </h1>
          {chart.designer && (
            <p className="text-sm text-stone-500 dark:text-stone-400">by {chart.designer.name}</p>
          )}
          <div className="flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-400">
            {effectiveStitchCount > 0 && (
              <span>
                {approximate && "~"}
                {formatNumber(effectiveStitchCount)} stitches
              </span>
            )}
            {chart.stitchesWide > 0 && chart.stitchesHigh > 0 && (
              <span>
                {chart.stitchesWide} x {chart.stitchesHigh}
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
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Added {formatDate(chart.dateAdded)}
          </p>

          {/* Action buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" render={<Link href={`/charts/${chart.id}/edit`} />}>
              <Pencil className="size-4" data-icon="inline-start" />
              Edit
            </Button>
            <DeleteChartDialog chartId={chart.id} chartName={chart.name} />
          </div>
        </div>
      </div>

      {/* Status control */}
      {project && <StatusControl chartId={chart.id} currentStatus={status} />}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList variant="line">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="supplies" disabled>
            Supplies
          </TabsTrigger>
          <TabsTrigger value="sessions" disabled>
            Sessions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="pt-6">
          <OverviewTab chart={chart} />
        </TabsContent>
      </Tabs>
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
    <div className="flex max-h-80 w-full items-center justify-center rounded-lg bg-gradient-to-br from-stone-100 to-stone-200 lg:w-80 dark:from-stone-800 dark:to-stone-900">
      <div className="flex flex-col items-center gap-2 py-16">
        <Image className="h-8 w-8 text-stone-300 dark:text-stone-600" strokeWidth={1.5} />
        <span className="text-xs text-stone-400 dark:text-stone-500">No cover image</span>
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
          <Button variant="ghost" onClick={() => setOpen(false)} autoFocus>
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

      {/* Kitting Status */}
      <InfoCard icon={Package} title="Kitting Status">
        <p className="text-sm text-stone-400 dark:text-stone-500">
          Supply tracking available in a future update
        </p>
      </InfoCard>

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

      {/* Project Setup */}
      {project && (
        <InfoCard icon={Settings} title="Project Setup" className="lg:col-span-2">
          <div>
            <DetailRow label="Fabric" value={project.fabricId ?? "Not assigned"} />
            <DetailRow label="Project Bin" value={project.projectBin ?? "-"} />
            <DetailRow label="iPad App" value={project.ipadApp ?? "-"} />
            <DetailRow
              label="Onion Skinning"
              value={project.needsOnionSkinning ? "Needed" : "Not needed"}
            />
          </div>
        </InfoCard>
      )}

      {/* Dates */}
      <InfoCard icon={Calendar} title="Dates" className="lg:col-span-2">
        <div>
          <DetailRow label="Added" value={formatDate(chart.dateAdded)} />
          <DetailRow label="Started" value={formatDate(project?.startDate)} />
          <DetailRow label="Finished" value={formatDate(project?.finishDate)} />
          <DetailRow label="FFO" value={formatDate(project?.ffoDate)} />
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
            className="text-sm font-medium text-emerald-600 underline-offset-2 hover:underline disabled:opacity-50 dark:text-emerald-500"
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
