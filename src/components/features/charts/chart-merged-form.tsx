"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type {
  Designer,
  Fabric,
  FabricBrand,
  Genre,
  ProjectStatus,
} from "@/generated/prisma/client";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";
import { useChartForm } from "./use-chart-form";
import { saveDraft, loadDraft, clearDraft } from "./use-draft-persistence";
import { FormField } from "./form-primitives/form-field";
import { SearchableSelect } from "./form-primitives/searchable-select";
import { CoverImageUpload } from "./form-primitives/cover-image-upload";
import { FileUpload } from "./form-primitives/file-upload";
import { GenrePicker } from "./form-primitives/genre-picker";
import { StitchCountFields } from "./form-primitives/stitch-count-fields";
import { StyledCheckbox } from "./form-primitives/styled-checkbox";
import { StartPreferenceFields } from "./form-primitives/start-preference-fields";
import { PatternTypeCards } from "./form-primitives/pattern-type-cards";
import { StickySaveBar } from "./form-primitives/sticky-save-bar";
import { InlineNameDialog } from "./inline-name-dialog";

interface ChartMergedFormProps {
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
}

export function ChartMergedForm({
  designers,
  genres,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
}: ChartMergedFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const hydratedRef = useRef(false);
  const redirectToSuppliesRef = useRef(false);

  // Draft state for save button feedback
  const [saveDraftLabel, setSaveDraftLabel] = useState("Save Draft");
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  // Inline add dialogs
  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [storageDialogName, setStorageDialogName] = useState("");
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [appDialogName, setAppDialogName] = useState("");

  const onSuccess = useCallback(
    (chartId: string) => {
      clearDraft();
      if (redirectToSuppliesRef.current) {
        router.push(`/charts/${chartId}?tab=supplies`);
      } else {
        router.push("/charts");
      }
    },
    [router],
  );

  const handleAddSupplies = useCallback(() => {
    redirectToSuppliesRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

  const form = useChartForm({
    mode: "create",
    designers,
    genres,
    storageLocations,
    stitchingApps,
    onSuccess,
  });

  // Draft hydration on mount (D-07)
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const designerIds = designers.map((d) => d.id);
    const storageIds = storageLocations.map((s) => s.id);
    const appIds = stitchingApps.map((a) => a.id);
    const fabricIds = unassignedFabrics.map((f) => f.id);

    const defaultValues = {
      name: "",
      designerId: null,
      coverImageUrl: null,
      coverThumbnailUrl: null,
      digitalFileUrl: null,
      stitchesWide: 0,
      stitchesHigh: 0,
      stitchCount: 0,
      stitchCountApproximate: false,
      genreIds: [] as string[],
      isPaperChart: false,
      isFormalKit: false,
      kitColorCount: null,
      isSAL: false,
      notes: "",
      status: "UNSTARTED" as ProjectStatus,
      storageLocationId: null,
      stitchingAppId: null,
      fabricId: null,
      needsOnionSkinning: false,
      startDate: "",
      finishDate: "",
      ffoDate: "",
      wantToStartNext: false,
      preferredStartSeason: null,
      startingStitches: 0,
    };

    const draft = loadDraft(defaultValues, designerIds, storageIds, appIds, fabricIds);
    if (!draft) return;

    // Hydrate each field from draft
    const keys = Object.keys(draft) as (keyof typeof draft)[];
    for (const key of keys) {
      const val = draft[key];
      if (val !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        form.setField(key, val as any);
      }
    }

    toast.info("Draft restored");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDraft = useCallback(() => {
    setIsSavingDraft(true);
    setSaveDraftLabel("Saving...");
    saveDraft(form.values);
    setSaveDraftLabel("Saved!");
    setTimeout(() => {
      setSaveDraftLabel("Save Draft");
      setIsSavingDraft(false);
    }, 1000);
  }, [form.values]);

  // Storage and stitching app options
  const storageOptions = form.storageLocationsList.map((sl) => ({
    value: sl.id,
    label: sl.name,
  }));

  const appOptions = form.stitchingAppsList.map((sa) => ({
    value: sa.id,
    label: sa.name,
  }));

  const designerOptions = form.designers.map((d) => ({
    value: d.id,
    label: d.name,
  }));

  const fabricOptions = unassignedFabrics.map((f) => ({
    value: f.id,
    label: `${f.name} - ${f.count}ct ${f.type} (${f.brand.name})`,
  }));

  return (
    <div className="mx-auto max-w-[720px] px-5 pt-12 pb-20 lg:px-8">
      <Link
        href="/charts"
        className="group text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft
          className="size-4 transition-transform group-hover:-translate-x-0.5"
          aria-hidden="true"
        />
        Charts
      </Link>

      <h1 className="font-heading text-foreground mb-1 text-2xl font-semibold">Add New Chart</h1>
      <p className="text-muted-foreground mb-8 text-sm">Create a chart and set up your project</p>

      <form ref={formRef} onSubmit={form.handleSubmit} className="space-y-5">
        {/* === IDENTITY GROUP === */}
        <FormField
          label="Chart Name"
          htmlFor="chart-name"
          required
          error={form.errors["chart.name"]}
        >
          <Input
            id="chart-name"
            value={form.values.name}
            onChange={(e) => form.setField("name", e.target.value)}
            placeholder="e.g. Enchanted Forest Sampler"
            aria-required="true"
            aria-invalid={!!form.errors["chart.name"]}
          />
        </FormField>

        <FormField label="Designer" htmlFor="designer">
          <SearchableSelect
            options={designerOptions}
            value={form.values.designerId}
            onChange={(v) => form.setField("designerId", v)}
            onAddNew={(searchTerm) => void form.handleAddDesigner(searchTerm)}
            placeholder="Select designer..."
          />
        </FormField>

        <FormField label="Cover Image" htmlFor="cover-image">
          <CoverImageUpload
            currentImageUrl={form.values.coverImageUrl}
            onUploadComplete={(key) => form.setField("coverImageUrl", key)}
            onRemove={() => {
              form.setField("coverImageUrl", null);
              form.setField("coverThumbnailUrl", null);
            }}
          />
        </FormField>

        <FormField label="Genres" htmlFor="genres">
          <GenrePicker
            genres={form.genres}
            selectedIds={form.values.genreIds}
            onToggle={(id) => {
              const ids = form.values.genreIds.includes(id)
                ? form.values.genreIds.filter((g) => g !== id)
                : [...form.values.genreIds, id];
              form.setField("genreIds", ids);
            }}
            onAddGenre={form.handleAddGenre}
          />
        </FormField>

        {/* === SECTION DIVIDER === */}
        <hr className="border-border/50 my-6 border-t border-none" />

        {/* === PATTERN GROUP === */}
        <StitchCountFields
          stitchesWide={form.values.stitchesWide}
          stitchesHigh={form.values.stitchesHigh}
          stitchCount={form.values.stitchCount}
          onWidthChange={(v) => form.setField("stitchesWide", parseInt(v) || 0)}
          onHeightChange={(v) => form.setField("stitchesHigh", parseInt(v) || 0)}
          onCountChange={(v) => form.setField("stitchCount", parseInt(v) || 0)}
          errors={{
            stitchCount: form.errors["chart.stitchCount"],
          }}
        />

        <PatternTypeCards
          isPaperChart={form.values.isPaperChart}
          isFormalKit={form.values.isFormalKit}
          isSAL={form.values.isSAL}
          kitColorCount={form.values.kitColorCount}
          onFormatChange={(v) => form.setField("isPaperChart", v)}
          onFormalKitChange={(v) => form.setField("isFormalKit", v)}
          onSALChange={(v) => form.setField("isSAL", v)}
          onKitColorCountChange={(v) =>
            form.setField("kitColorCount", v === "" ? null : parseInt(v) || null)
          }
          errors={{ kitColorCount: form.errors["chart.kitColorCount"] }}
        />

        <StyledCheckbox
          checked={form.values.needsOnionSkinning}
          onChange={(v) => form.setField("needsOnionSkinning", v)}
          label="Needs onion skinning"
        />

        {/* === SECTION DIVIDER === */}
        <hr className="border-border/50 my-6 border-t border-none" />

        {/* === WORKFLOW GROUP === */}
        <FormField
          label="Status"
          htmlFor="project-status"
          required
          error={form.errors["project.status"]}
        >
          <select
            id="project-status"
            value={form.values.status}
            onChange={(e) => form.setField("status", e.target.value as ProjectStatus)}
            className="border-border bg-background text-foreground focus:border-primary focus:ring-ring h-9 w-full rounded-lg border px-3 text-sm focus:ring-2 focus:outline-none"
          >
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_CONFIG[s as keyof typeof STATUS_CONFIG]?.label ?? s}
              </option>
            ))}
          </select>
        </FormField>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Storage Location" htmlFor="storage-location">
            <SearchableSelect
              options={storageOptions}
              value={form.values.storageLocationId}
              onChange={(v) => form.setField("storageLocationId", v)}
              onAddNew={(searchTerm) => {
                setStorageDialogName(searchTerm);
                setStorageDialogOpen(true);
              }}
              placeholder="Select storage location..."
            />
            <InlineNameDialog
              open={storageDialogOpen}
              onOpenChange={setStorageDialogOpen}
              title="Add Storage Location"
              initialName={storageDialogName}
              placeholder="e.g. Project Bin A"
              onSubmit={form.handleAddStorageLocation}
            />
          </FormField>

          <FormField label="Stitching App" htmlFor="stitching-app">
            <SearchableSelect
              options={appOptions}
              value={form.values.stitchingAppId}
              onChange={(v) => form.setField("stitchingAppId", v)}
              onAddNew={(searchTerm) => {
                setAppDialogName(searchTerm);
                setAppDialogOpen(true);
              }}
              placeholder="Select stitching app..."
            />
            <InlineNameDialog
              open={appDialogOpen}
              onOpenChange={setAppDialogOpen}
              title="Add Stitching App"
              initialName={appDialogName}
              placeholder="e.g. Pattern Keeper"
              onSubmit={form.handleAddStitchingApp}
            />
          </FormField>
        </div>

        <FormField label="Digital Working Copy" htmlFor="digital-file">
          <FileUpload
            onUploadComplete={(key) => form.setField("digitalFileUrl", key)}
            onRemove={() => form.setField("digitalFileUrl", null)}
          />
        </FormField>

        {/* === SECTION DIVIDER === */}
        <hr className="border-border/50 my-6 border-t border-none" />

        {/* === TIMELINE GROUP === */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <FormField label="Start Date" htmlFor="start-date">
            <Input
              id="start-date"
              type="date"
              value={form.values.startDate}
              onChange={(e) => form.setField("startDate", e.target.value)}
            />
          </FormField>

          <FormField label="Finish Date" htmlFor="finish-date">
            <Input
              id="finish-date"
              type="date"
              value={form.values.finishDate}
              onChange={(e) => form.setField("finishDate", e.target.value)}
            />
          </FormField>

          <FormField label="FFO Date" htmlFor="ffo-date">
            <Input
              id="ffo-date"
              type="date"
              value={form.values.ffoDate}
              onChange={(e) => form.setField("ffoDate", e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Notes" htmlFor="notes">
          <Textarea
            id="notes"
            value={form.values.notes}
            onChange={(e) => form.setField("notes", e.target.value)}
            rows={3}
          />
        </FormField>

        <StyledCheckbox
          checked={form.values.wantToStartNext}
          onChange={(v) => form.setField("wantToStartNext", v)}
          label="Want to start next"
        />

        {form.values.wantToStartNext && (
          <FormField label="Preferred Start" htmlFor="preferred-start">
            <StartPreferenceFields
              value={form.values.preferredStartSeason}
              onChange={(v) => form.setField("preferredStartSeason", v)}
            />
          </FormField>
        )}

        {/* === SECTION DIVIDER === */}
        <hr className="border-border/50 my-6 border-t border-none" />

        {/* === MILESTONE MARKER === */}
        <div className="bg-primary/5 border-primary/15 flex items-center gap-3 rounded-lg border p-4 px-6">
          <div className="bg-primary text-primary-foreground flex size-6 shrink-0 items-center justify-center rounded-full">
            <Check className="size-3.5" />
          </div>
          <p className="flex-1 text-sm font-medium">
            Project details filled in. Ready for supplies?
          </p>
          <button
            type="button"
            disabled={!form.values.name || form.isPending}
            onClick={handleAddSupplies}
            className="text-primary text-sm font-medium hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-40"
          >
            {form.isPending && redirectToSuppliesRef.current ? "Creating..." : "Add supplies →"}
          </button>
        </div>

        {/* === FORM-LEVEL ERROR === */}
        {form.errors._form && (
          <p role="alert" className="text-destructive text-sm">
            {form.errors._form}
          </p>
        )}
      </form>

      {/* === STICKY SAVE BAR === */}
      <StickySaveBar
        chartName={form.values.name}
        onSaveDraft={handleSaveDraft}
        onSubmit={() => formRef.current?.requestSubmit()}
        isSubmitting={form.isPending}
        isSavingDraft={isSavingDraft}
        saveDraftLabel={saveDraftLabel}
      />
    </div>
  );
}
