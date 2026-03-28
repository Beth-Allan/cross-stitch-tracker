"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { createChart, updateChart } from "@/lib/actions/chart-actions";
import { createDesigner } from "@/lib/actions/designer-actions";
import { createGenre } from "@/lib/actions/genre-actions";
import { chartFormSchema, type ChartFormInput } from "@/lib/validations/chart";
import { STATUS_CONFIG, PROJECT_STATUSES } from "@/lib/utils/status";
import type { ChartWithProject } from "@/types/chart";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SearchableSelect } from "./searchable-select";
import { GenrePicker } from "./genre-picker";
import { InlineEntityDialog } from "./inline-entity-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChartFormProps {
  mode: "add" | "edit";
  initialData?: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
}

// ---------------------------------------------------------------------------
// Section heading component
// ---------------------------------------------------------------------------

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold tracking-widest text-stone-400 uppercase dark:text-stone-500">
      {children}
    </h2>
  );
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label
      htmlFor={htmlFor}
      className="text-xs font-semibold tracking-wider text-stone-400 uppercase dark:text-stone-500"
    >
      {children}
    </Label>
  );
}

// ---------------------------------------------------------------------------
// Main form component
// ---------------------------------------------------------------------------

export function ChartForm({
  mode,
  initialData,
  designers: initialDesigners,
  genres: initialGenres,
}: ChartFormProps) {
  const router = useRouter();

  // Local mutable copies of entities (for inline creation)
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
  const [genres, setGenres] = useState<Genre[]>(initialGenres);

  // Inline dialog state
  const [designerDialogOpen, setDesignerDialogOpen] = useState(false);
  const [genreDialogOpen, setGenreDialogOpen] = useState(false);

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // ---------------------------------------------------------------------------
  // Chart fields
  // ---------------------------------------------------------------------------
  const [name, setName] = useState(initialData?.name ?? "");
  const [designerId, setDesignerId] = useState<string | null>(initialData?.designerId ?? null);
  const [stitchesWide, setStitchesWide] = useState<string>(
    initialData?.stitchesWide?.toString() ?? "",
  );
  const [stitchesHigh, setStitchesHigh] = useState<string>(
    initialData?.stitchesHigh?.toString() ?? "",
  );
  const [stitchCount, setStitchCount] = useState<string>(
    initialData?.stitchCount?.toString() ?? "",
  );
  const [genreIds, setGenreIds] = useState<string[]>(initialData?.genres.map((g) => g.id) ?? []);
  const [isPaperChart, setIsPaperChart] = useState(initialData?.isPaperChart ?? false);
  const [isFormalKit, setIsFormalKit] = useState(initialData?.isFormalKit ?? false);
  const [kitColorCount, setKitColorCount] = useState<string>(
    initialData?.kitColorCount?.toString() ?? "",
  );
  const [isSAL, setIsSAL] = useState(initialData?.isSAL ?? false);
  const [notes, setNotes] = useState(initialData?.notes ?? "");

  // ---------------------------------------------------------------------------
  // Project fields
  // ---------------------------------------------------------------------------
  const [status, setStatus] = useState<ProjectStatus>(initialData?.project?.status ?? "UNSTARTED");
  const [projectBin, setProjectBin] = useState(initialData?.project?.projectBin ?? "");
  const [ipadApp, setIpadApp] = useState(initialData?.project?.ipadApp ?? "");
  const [needsOnionSkinning, setNeedsOnionSkinning] = useState(
    initialData?.project?.needsOnionSkinning ?? false,
  );
  const [startDate, setStartDate] = useState(
    initialData?.project?.startDate
      ? new Date(initialData.project.startDate).toISOString().split("T")[0]
      : "",
  );
  const [finishDate, setFinishDate] = useState(
    initialData?.project?.finishDate
      ? new Date(initialData.project.finishDate).toISOString().split("T")[0]
      : "",
  );
  const [ffoDate, setFfoDate] = useState(
    initialData?.project?.ffoDate
      ? new Date(initialData.project.ffoDate).toISOString().split("T")[0]
      : "",
  );
  const [wantToStartNext, setWantToStartNext] = useState(
    initialData?.project?.wantToStartNext ?? false,
  );
  const [preferredStartSeason, setPreferredStartSeason] = useState<string | null>(
    initialData?.project?.preferredStartSeason ?? null,
  );

  // ---------------------------------------------------------------------------
  // Build form data for validation and submission
  // ---------------------------------------------------------------------------
  const buildFormData = useCallback((): ChartFormInput => {
    return {
      chart: {
        name: name.trim(),
        designerId: designerId || null,
        stitchCount: stitchCount ? parseInt(stitchCount, 10) : 0,
        stitchCountApproximate: false,
        stitchesWide: stitchesWide ? parseInt(stitchesWide, 10) : 0,
        stitchesHigh: stitchesHigh ? parseInt(stitchesHigh, 10) : 0,
        genreIds,
        isPaperChart,
        isFormalKit,
        isSAL,
        kitColorCount: isFormalKit && kitColorCount ? parseInt(kitColorCount, 10) : null,
        notes: notes.trim() || null,
      },
      project: {
        status,
        fabricId: null, // Phase 4 will wire fabric selection
        projectBin: projectBin.trim() || null,
        ipadApp: ipadApp.trim() || null,
        needsOnionSkinning,
        startDate: startDate || null,
        finishDate: finishDate || null,
        ffoDate: ffoDate || null,
        wantToStartNext,
        preferredStartSeason,
        startingStitches: 0,
      },
    };
  }, [
    name,
    designerId,
    stitchCount,
    stitchesWide,
    stitchesHigh,
    genreIds,
    isPaperChart,
    isFormalKit,
    isSAL,
    kitColorCount,
    notes,
    status,
    projectBin,
    ipadApp,
    needsOnionSkinning,
    startDate,
    finishDate,
    ffoDate,
    wantToStartNext,
    preferredStartSeason,
  ]);

  // ---------------------------------------------------------------------------
  // Submission
  // ---------------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFieldErrors({});
      setIsSubmitting(true);

      const formData = buildFormData();
      const parsed = chartFormSchema.safeParse(formData);

      if (!parsed.success) {
        const errors: Record<string, string> = {};
        for (const issue of parsed.error.issues) {
          const key = issue.path.join(".");
          errors[key] = issue.message;
        }
        setFieldErrors(errors);
        setIsSubmitting(false);
        return;
      }

      try {
        if (mode === "add") {
          const result = await createChart(parsed.data);
          if ("chartId" in result && result.success) {
            toast.success("Chart added");
            router.push(`/charts/${result.chartId}`);
            return;
          }
          if ("error" in result) {
            toast.error(result.error);
          }
        } else if (initialData) {
          const result = await updateChart(initialData.id, parsed.data);
          if (result.success) {
            toast.success("Changes saved");
            router.push(`/charts/${initialData.id}`);
            return;
          }
          if ("error" in result) {
            toast.error(result.error);
          }
        }
      } catch {
        toast.error("Something went wrong. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [buildFormData, mode, initialData, router],
  );

  // ---------------------------------------------------------------------------
  // Inline entity creation handlers
  // ---------------------------------------------------------------------------
  const handleAddDesigner = useCallback(async (designerName: string, website?: string) => {
    const result = await createDesigner({ name: designerName, website: website || null });
    if ("designer" in result && result.success) {
      setDesigners((prev) => [...prev, result.designer]);
      setDesignerId(result.designer.id);
    } else if ("error" in result) {
      throw new Error(result.error);
    }
  }, []);

  const handleAddGenre = useCallback(async (genreName: string) => {
    const result = await createGenre({ name: genreName });
    if ("genre" in result && result.success) {
      setGenres((prev) => [...prev, result.genre]);
      setGenreIds((prev) => [...prev, result.genre.id]);
    } else if ("error" in result) {
      throw new Error(result.error);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Helper to get field error
  // ---------------------------------------------------------------------------
  function fieldError(path: string): string | undefined {
    return fieldErrors[path];
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const designerOptions = designers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const seasonOptions = ["Spring", "Summer", "Fall", "Winter"];

  return (
    <div className="p-5 lg:p-8">
      {/* Back link */}
      <Link
        href="/charts"
        className="group mb-2 inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Charts
      </Link>

      {/* Page title */}
      <h1 className="font-heading mb-6 text-2xl font-semibold text-stone-900 dark:text-stone-100">
        {mode === "add" ? "Add New Chart" : "Edit Chart"}
      </h1>

      <form onSubmit={(e) => void handleSubmit(e)} className="mx-auto max-w-2xl space-y-5">
        {/* ── BASIC INFO ── */}
        <SectionHeading>Basic Info</SectionHeading>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="chart-name">Chart Name</FieldLabel>
          <Input
            id="chart-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Enchanted Forest Sampler"
            aria-invalid={!!fieldError("chart.name")}
            className={fieldError("chart.name") ? "border-destructive" : ""}
          />
          {fieldError("chart.name") && (
            <p className="text-destructive text-xs">{fieldError("chart.name")}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Designer</FieldLabel>
          <SearchableSelect
            value={designerId}
            onValueChange={setDesignerId}
            options={designerOptions}
            placeholder="Search designers..."
            onAddNew={() => setDesignerDialogOpen(true)}
            addNewLabel="Add designer"
          />
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Cover Image</FieldLabel>
          <p className="text-xs text-stone-400">File uploads available after R2 is configured</p>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Digital Working Copy</FieldLabel>
          <p className="text-xs text-stone-400">File uploads available after R2 is configured</p>
        </div>

        {/* ── STITCH COUNT & DIMENSIONS ── */}
        <SectionHeading>Stitch Count &amp; Dimensions</SectionHeading>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="stitch-width">Width</FieldLabel>
            <Input
              id="stitch-width"
              type="number"
              min={0}
              value={stitchesWide}
              onChange={(e) => setStitchesWide(e.target.value)}
              placeholder="w"
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="stitch-height">Height</FieldLabel>
            <Input
              id="stitch-height"
              type="number"
              min={0}
              value={stitchesHigh}
              onChange={(e) => setStitchesHigh(e.target.value)}
              placeholder="h"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <FieldLabel htmlFor="stitch-count">Total Stitch Count</FieldLabel>
          <Input
            id="stitch-count"
            type="number"
            min={0}
            value={stitchCount}
            onChange={(e) => setStitchCount(e.target.value)}
            placeholder="Total stitches"
          />
          <p className="text-xs text-stone-400">Leave empty to auto-calculate from dimensions</p>
        </div>

        {/* ── GENRE(S) ── */}
        <SectionHeading>Genre(s)</SectionHeading>

        <GenrePicker
          selectedIds={genreIds}
          onSelectionChange={setGenreIds}
          genres={genres}
          onAddNew={() => setGenreDialogOpen(true)}
        />

        {/* ── PATTERN TYPE ── */}
        <SectionHeading>Pattern Type</SectionHeading>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="paper-chart"
              checked={isPaperChart}
              onChange={(e) => setIsPaperChart(e.target.checked)}
              className="border-input focus:ring-ring size-4 rounded text-emerald-600"
            />
            <Label htmlFor="paper-chart" className="text-sm">
              Paper chart
            </Label>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="formal-kit"
                checked={isFormalKit}
                onChange={(e) => setIsFormalKit(e.target.checked)}
                className="border-input focus:ring-ring size-4 rounded text-emerald-600"
              />
              <Label htmlFor="formal-kit" className="text-sm">
                Formal kit
              </Label>
            </div>
            {isFormalKit && (
              <div className="ml-6 space-y-1.5">
                <FieldLabel htmlFor="kit-color-count">Kit Color Count</FieldLabel>
                <Input
                  id="kit-color-count"
                  type="number"
                  min={1}
                  value={kitColorCount}
                  onChange={(e) => setKitColorCount(e.target.value)}
                  placeholder="Number of colors in kit"
                  className="max-w-xs"
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sal"
              checked={isSAL}
              onChange={(e) => setIsSAL(e.target.checked)}
              className="border-input focus:ring-ring size-4 rounded text-emerald-600"
            />
            <Label htmlFor="sal" className="text-sm">
              SAL (Stitch-Along)
            </Label>
          </div>
        </div>

        {/* ── PROJECT SETUP ── */}
        <SectionHeading>Project Setup</SectionHeading>

        <div className="space-y-1.5">
          <FieldLabel>Status</FieldLabel>
          <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROJECT_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Fabric</FieldLabel>
          <Input disabled placeholder="Not assigned (available in Phase 4)" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="project-bin">Project Bin</FieldLabel>
            <Input
              id="project-bin"
              value={projectBin}
              onChange={(e) => setProjectBin(e.target.value)}
              placeholder="e.g. Bin A"
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="ipad-app">iPad App</FieldLabel>
            <Input
              id="ipad-app"
              value={ipadApp}
              onChange={(e) => setIpadApp(e.target.value)}
              placeholder="e.g. Markup R-XP"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="onion-skinning"
            checked={needsOnionSkinning}
            onChange={(e) => setNeedsOnionSkinning(e.target.checked)}
            className="border-input focus:ring-ring size-4 rounded text-emerald-600"
          />
          <Label htmlFor="onion-skinning" className="text-sm">
            Needs onion skinning
          </Label>
        </div>

        {/* ── DATES ── */}
        <SectionHeading>Dates</SectionHeading>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <FieldLabel htmlFor="start-date">Start Date</FieldLabel>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="finish-date">Finish Date</FieldLabel>
            <Input
              id="finish-date"
              type="date"
              value={finishDate}
              onChange={(e) => setFinishDate(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel htmlFor="ffo-date">FFO Date</FieldLabel>
            <Input
              id="ffo-date"
              type="date"
              value={ffoDate}
              onChange={(e) => setFfoDate(e.target.value)}
            />
          </div>
        </div>

        {/* ── GOALS & PLANNING ── */}
        <SectionHeading>Goals &amp; Planning</SectionHeading>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="want-to-start"
            checked={wantToStartNext}
            onChange={(e) => setWantToStartNext(e.target.checked)}
            className="border-input focus:ring-ring size-4 rounded text-emerald-600"
          />
          <Label htmlFor="want-to-start" className="text-sm">
            Want to start next
          </Label>
        </div>

        <div className="space-y-1.5">
          <FieldLabel>Preferred Start Season</FieldLabel>
          <Select
            value={preferredStartSeason ?? ""}
            onValueChange={(val) => setPreferredStartSeason(val || null)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="No preference" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">No preference</SelectItem>
              {seasonOptions.map((season) => (
                <SelectItem key={season} value={season}>
                  {season}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* ── Notes ── */}
        <div className="space-y-1.5">
          <FieldLabel htmlFor="notes">Notes</FieldLabel>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any additional notes about this chart..."
            className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 dark:bg-input/30 w-full rounded-lg border bg-transparent px-2.5 py-2 text-sm transition-colors outline-none focus-visible:ring-3"
          />
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-end gap-3 border-t border-stone-200 pt-4 dark:border-stone-800">
          {mode === "add" ? (
            <Link
              href="/charts"
              className="hover:bg-muted hover:text-foreground inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium transition-all"
            >
              Back to Charts
            </Link>
          ) : (
            <Link
              href={`/charts/${initialData?.id}`}
              className="hover:bg-muted hover:text-foreground inline-flex h-8 items-center rounded-lg px-2.5 text-sm font-medium transition-all"
            >
              Discard Changes
            </Link>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-emerald-600 text-white hover:bg-emerald-700"
          >
            {isSubmitting ? "Saving..." : mode === "add" ? "Add Chart" : "Save Changes"}
          </Button>
        </div>
      </form>

      {/* Inline entity creation dialogs */}
      <InlineEntityDialog
        open={designerDialogOpen}
        onOpenChange={setDesignerDialogOpen}
        title="Add Designer"
        fieldLabel="Name"
        fieldPlaceholder="Designer name"
        onSubmit={handleAddDesigner}
        submitLabel="Add Designer"
      />

      <InlineEntityDialog
        open={genreDialogOpen}
        onOpenChange={setGenreDialogOpen}
        title="Add Genre"
        fieldLabel="Name"
        fieldPlaceholder="Genre name"
        onSubmit={handleAddGenre}
        submitLabel="Add Genre"
      />
    </div>
  );
}
