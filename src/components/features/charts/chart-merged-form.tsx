"use client";

import { Activity, useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import type { ChartWithProject } from "@/types/chart";
import type { SeriesWithStats } from "@/types/series";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { PROJECT_STATUSES, STATUS_CONFIG } from "@/lib/utils/status";
import { useChartForm, type ChartFormValues } from "./use-chart-form";
import { saveDraftV2, loadDraftV2, clearDraft } from "./use-draft-persistence";
import { FormField } from "./form-primitives/form-field";
import { SearchableSelect } from "./form-primitives/searchable-select";
import { CoverImageUpload } from "./form-primitives/cover-image-upload";
import { ChartFileUpload } from "./form-primitives/chart-file-upload";
import { GenrePicker } from "./form-primitives/genre-picker";
import { StitchCountFields } from "./form-primitives/stitch-count-fields";
import { StyledCheckbox } from "./form-primitives/styled-checkbox";
import { StartPreferenceFields } from "./form-primitives/start-preference-fields";
import { PatternTypeCards } from "./form-primitives/pattern-type-cards";
import { StickySaveBar } from "./form-primitives/sticky-save-bar";
import { ManageSuppliesLink } from "./manage-supplies-link";
import { SummaryBar } from "./form-primitives/summary-bar";
import { CalculatorCard } from "./form-primitives/calculator-card";
import { InlineNameDialog } from "./inline-name-dialog";
import { InlineDesignerDialog } from "./inline-designer-dialog";
import {
  SupplyTable,
  CreationFlowAdapter,
  DEFAULT_CALC_PARAMS,
} from "@/components/features/supply-table";
import type {
  SupplyRow,
  CalcParams,
  SupplyType,
  SupplySearchResult,
  CreateSupplyData,
} from "@/components/features/supply-table";
import {
  getThreads,
  getBeads,
  getSpecialtyItems,
  createThread,
  createBead,
  createSpecialtyItem,
} from "@/lib/actions/supply-actions";
import { DEFAULT_SUPPLY_HEX } from "@/lib/constants";

/**
 * Build the createFn callback that maps CreateSupplyData fields to the
 * server action Zod schemas (threadSchema, beadSchema, specialtyItemSchema).
 *
 * Extracted as a named export so it can be tested in isolation.
 */
export function buildCreateFn() {
  return async (type: SupplyType, data: CreateSupplyData): Promise<SupplySearchResult> => {
    if (type === "THREAD") {
      const result = await createThread({
        colorName: data.name,
        colorCode: data.code || "CUSTOM",
        brandId: data.brandId,
        hexColor: data.hexColor ?? DEFAULT_SUPPLY_HEX,
        colorFamily: "NEUTRAL" as const,
      });
      if (!result.success) throw new Error(result.error);
      return {
        id: result.thread.id,
        type: "THREAD",
        code: result.thread.colorCode,
        name: result.thread.colorName,
        brandName: "",
        brandId: data.brandId,
        hexColor: result.thread.hexColor ?? "#000000",
      };
    }
    if (type === "BEAD") {
      const result = await createBead({
        colorName: data.name,
        productCode: data.code || "CUSTOM",
        brandId: data.brandId,
        hexColor: data.hexColor ?? DEFAULT_SUPPLY_HEX,
        colorFamily: "NEUTRAL" as const,
      });
      if (!result.success) throw new Error(result.error);
      return {
        id: result.bead.id,
        type: "BEAD",
        code: result.bead.productCode,
        name: result.bead.colorName,
        brandName: "",
        brandId: data.brandId,
        hexColor: result.bead.hexColor ?? "#000000",
      };
    }
    const result = await createSpecialtyItem({
      colorName: data.name,
      productCode: data.code || "CUSTOM",
      brandId: data.brandId,
      hexColor: data.hexColor ?? DEFAULT_SUPPLY_HEX,
    });
    if (!result.success) throw new Error(result.error);
    return {
      id: result.specialtyItem.id,
      type: "SPECIALTY",
      code: result.specialtyItem.productCode,
      name: result.specialtyItem.colorName,
      brandName: "",
      brandId: data.brandId,
      hexColor: result.specialtyItem.hexColor ?? "#000000",
    };
  };
}

interface ChartMergedFormProps {
  designers: Designer[];
  genres: Genre[];
  series: SeriesWithStats[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  mode?: "create" | "edit";
  initialData?: ChartWithProject;
  initialSupplyStitchTotal?: number;
}

export function ChartMergedForm({
  designers,
  genres,
  series,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
  mode: modeProp,
  initialData,
  initialSupplyStitchTotal,
}: ChartMergedFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const hydratedRef = useRef(false);

  const formMode = modeProp ?? "create";
  const isEdit = formMode === "edit";

  const [mode, setMode] = useState<"form" | "supply">("form");

  const [supplyRows, setSupplyRows] = useState<SupplyRow[]>([]);
  const [calcParams, setCalcParams] = useState<CalcParams>(DEFAULT_CALC_PARAMS);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const adapterRef = useRef<CreationFlowAdapter | null>(null);

  const submittedRef = useRef(false);

  const [saveDraftLabel, setSaveDraftLabel] = useState("Save Draft");
  const [isSavingDraft, setIsSavingDraft] = useState(false);

  const [storageDialogOpen, setStorageDialogOpen] = useState(false);
  const [storageDialogName, setStorageDialogName] = useState("");
  const [appDialogOpen, setAppDialogOpen] = useState(false);
  const [appDialogName, setAppDialogName] = useState("");
  const [designerDialogOpen, setDesignerDialogOpen] = useState(false);
  const [designerDialogName, setDesignerDialogName] = useState("");
  const [seriesDialogOpen, setSeriesDialogOpen] = useState(false);
  const [seriesDialogName, setSeriesDialogName] = useState("");

  if (!adapterRef.current) {
    const searchFn = async (type: SupplyType, query: string): Promise<SupplySearchResult[]> => {
      if (type === "THREAD") {
        const threads = await getThreads(undefined, undefined, query);
        return threads.map((t) => ({
          id: t.id,
          type: "THREAD" as const,
          code: t.colorCode,
          name: t.colorName,
          brandName: t.brand.name,
          brandId: t.brandId,
          hexColor: t.hexColor ?? "",
        }));
      }
      if (type === "BEAD") {
        const beads = await getBeads(query);
        return beads.map((b) => ({
          id: b.id,
          type: "BEAD" as const,
          code: b.productCode,
          name: b.colorName,
          brandName: b.brand.name,
          brandId: b.brandId,
          hexColor: b.hexColor ?? "",
        }));
      }
      const items = await getSpecialtyItems(query);
      return items.map((s) => ({
        id: s.id,
        type: "SPECIALTY" as const,
        code: s.productCode,
        name: s.colorName,
        brandName: s.brand.name,
        brandId: s.brandId,
        hexColor: s.hexColor ?? "",
      }));
    };
    adapterRef.current = new CreationFlowAdapter(setSupplyRows, searchFn, buildCreateFn());
  }

  const onSuccess = useCallback(
    (chartId: string) => {
      submittedRef.current = true;
      if (isEdit) {
        router.push(`/charts/${chartId}`);
        toast.success("Changes saved");
      } else {
        clearDraft();
        router.push("/charts");
      }
    },
    [router, isEdit],
  );

  const form = useChartForm({
    mode: formMode,
    initialData: isEdit ? initialData : undefined,
    designers,
    genres,
    series,
    storageLocations,
    stitchingApps,
    onSuccess,
    getSupplyRows: isEdit ? undefined : () => adapterRef.current?.getRows() ?? [],
    onValidationError: isEdit ? undefined : () => setMode("form"),
  });

  // Using refs avoids stale closures in the unmount auto-save cleanup function.
  const formValuesRef = useRef(form.values);
  const supplyRowsRef = useRef(supplyRows);
  const calcParamsRef = useRef(calcParams);
  formValuesRef.current = form.values;
  supplyRowsRef.current = supplyRows;
  calcParamsRef.current = calcParams;

  // Auto-save draft on unmount (handles client-side navigation via Next.js Link)
  // Only fires in create mode -- edit mode works on real server data, not local storage
  useEffect(() => {
    return () => {
      if (formMode === "create" && !submittedRef.current && formValuesRef.current.name) {
        saveDraftV2(formValuesRef.current, supplyRowsRef.current, calcParamsRef.current);
      }
    };
  }, [formMode]);

  const resolvedDesignerName = useMemo(() => {
    if (!form.values.designerId) return null;
    return form.designers.find((d) => d.id === form.values.designerId)?.name ?? null;
  }, [form.values.designerId, form.designers]);

  const supplyStitchTotal = useMemo(
    () => supplyRows.reduce((sum, row) => sum + row.stitchCount, 0),
    [supplyRows],
  );

  const effectiveStitchCount = useMemo(() => {
    if (form.values.stitchCount > 0) return form.values.stitchCount;
    if (form.values.stitchesWide > 0 && form.values.stitchesHigh > 0)
      return form.values.stitchesWide * form.values.stitchesHigh;
    return 0;
  }, [form.values.stitchCount, form.values.stitchesWide, form.values.stitchesHigh]);

  // Draft hydration on mount -- uses V2 format
  // Only fires in create mode -- edit mode loads from initialData via useChartForm
  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    if (formMode !== "create") return;

    const designerIds = designers.map((d) => d.id);
    const storageIds = storageLocations.map((s) => s.id);
    const appIds = stitchingApps.map((a) => a.id);
    const fabricIds = unassignedFabrics.map((f) => f.id);

    const defaultValues = {
      name: "",
      designerId: null,
      seriesId: null,
      coverImageUrl: null,
      coverThumbnailUrl: null,
      uploadedFiles: [] as Array<{
        key: string;
        filename: string;
        mimeType: string;
        fileSize: number;
      }>,
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

    // Detect pre-load fabricId for stale check
    const rawDraft = (() => {
      try {
        const raw = localStorage.getItem("chart-draft");
        if (!raw) return null;
        return JSON.parse(raw);
      } catch (error) {
        console.error("Load chart draft failed:", error);
        return null;
      }
    })();
    const rawFabricId = rawDraft?.version === 2 ? rawDraft.form?.fabricId : rawDraft?.fabricId;

    const draft = loadDraftV2(defaultValues, designerIds, storageIds, appIds, fabricIds);
    if (!draft) return;

    // Hydrate each field from draft using a type-safe setter that preserves
    // the key-value correlation TypeScript can't infer from Object.keys()
    function hydrateField<K extends keyof ChartFormValues>(key: K, source: ChartFormValues) {
      form.setField(key, source[key]);
    }
    for (const key of Object.keys(draft.form) as (keyof ChartFormValues)[]) {
      if (draft.form[key] !== undefined) {
        hydrateField(key, draft.form);
      }
    }

    // Restore supply rows
    if (draft.supplies.length > 0) {
      adapterRef.current!.loadRows(draft.supplies);
    }

    // Restore calc params
    setCalcParams(draft.calcParams);

    // Stale fabric detection: compare raw draft fabricId to restored (may have been nulled)
    if (rawFabricId && !draft.form.fabricId) {
      toast.warning("Draft restored (fabric no longer available -- please reselect)");
    } else {
      toast.info("Draft restored");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveDraft = useCallback(() => {
    setIsSavingDraft(true);
    setSaveDraftLabel("Saving...");
    saveDraftV2(form.values, supplyRows, calcParams);
    setSaveDraftLabel("Saved!");
    setTimeout(() => {
      setSaveDraftLabel("Save Draft");
      setIsSavingDraft(false);
    }, 1000);
  }, [form.values, supplyRows, calcParams]);

  const handleAddSuppliesClick = useCallback(() => {
    setMode("supply");
  }, []);

  const handleDetailsClick = useCallback(() => {
    setMode("form");
    // Restore focus to last focused form element
    setTimeout(() => {
      lastFocusedRef.current?.focus();
    }, 0);
  }, []);

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

  const seriesOptions = form.seriesList.map((s) => ({
    value: s.id,
    label: s.name,
  }));

  const fabricOptions = unassignedFabrics.map((f) => ({
    value: f.id,
    label: `${f.name} - ${f.count}ct ${f.type} (${f.brand.name})`,
    count: f.count,
  }));

  return (
    <>
      <Activity mode={isEdit || mode === "form" ? "visible" : "hidden"}>
        <div className="mx-auto max-w-[720px] px-5 pt-12 pb-20 lg:px-8">
          {isEdit && initialData ? (
            <Link
              href={`/charts/${initialData.id}`}
              className="text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
            >
              <ArrowLeft className="size-4" />
              Back to project
            </Link>
          ) : (
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
          )}

          <h1 className="font-heading text-foreground mb-1 text-2xl font-semibold">
            {isEdit ? `Edit ${initialData!.name}` : "Add New Chart"}
          </h1>
          <p className="text-muted-foreground mb-8 text-sm">
            {isEdit
              ? "Update your chart and project details"
              : "Create a chart and set up your project"}
          </p>

          <form
            ref={formRef}
            onSubmit={form.handleSubmit}
            className="space-y-5"
            onFocusCapture={(e) => {
              lastFocusedRef.current = e.target as HTMLElement;
            }}
          >
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
                onAddNew={(searchTerm) => {
                  setDesignerDialogName(searchTerm);
                  setDesignerDialogOpen(true);
                }}
                placeholder="Select designer..."
              />
              <InlineDesignerDialog
                open={designerDialogOpen}
                onOpenChange={setDesignerDialogOpen}
                initialName={designerDialogName}
                onSubmit={form.handleAddDesigner}
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

            <FormField label="Series" htmlFor="series">
              <SearchableSelect
                options={seriesOptions}
                value={form.values.seriesId}
                onChange={(v) => form.setField("seriesId", v)}
                onAddNew={(searchTerm) => {
                  setSeriesDialogName(searchTerm);
                  setSeriesDialogOpen(true);
                }}
                placeholder="Select series..."
              />
              <InlineNameDialog
                open={seriesDialogOpen}
                onOpenChange={setSeriesDialogOpen}
                title="Add New Series"
                initialName={seriesDialogName}
                placeholder="e.g. Mirabilia Collection"
                submitLabel="Add Series"
                requiredError="Series name is required"
                onSubmit={form.handleAddSeries}
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

            <hr className="border-border/50 my-6 border-t border-none" />

            <StitchCountFields
              stitchesWide={form.values.stitchesWide}
              stitchesHigh={form.values.stitchesHigh}
              stitchCount={form.values.stitchCount}
              supplyStitchTotal={isEdit ? (initialSupplyStitchTotal ?? 0) : supplyStitchTotal}
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

            <hr className="border-border/50 my-6 border-t border-none" />

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

            <FormField label="Digital Working Copies" htmlFor="digital-files">
              <ChartFileUpload
                uploadedFiles={form.values.uploadedFiles}
                onFilesChange={(files) => form.setField("uploadedFiles", files)}
              />
            </FormField>

            <hr className="border-border/50 my-6 border-t border-none" />

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

            <hr className="border-border/50 my-6 border-t border-none" />

            {isEdit ? (
              <ManageSuppliesLink chartId={initialData!.id} />
            ) : (
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
                  onClick={handleAddSuppliesClick}
                  className="text-primary text-sm font-medium hover:underline disabled:cursor-default disabled:no-underline disabled:opacity-40"
                >
                  Add supplies &rarr;
                </button>
              </div>
            )}

            {form.errors._form && (
              <p role="alert" className="text-destructive text-sm">
                {form.errors._form}
              </p>
            )}
          </form>
        </div>
      </Activity>

      {/* Conditional rendering (not Activity) so CalculatorCard's Base UI Popover
          initializes fresh when supply mode activates. Activity mode="hidden" defers
          FloatingRootContext init to OffscreenLane, leaving fabric dropdown broken
          on first click. CalcParams state lives in the parent, so remounting
          CalculatorCard on mode switch is safe. */}
      {!isEdit && mode === "supply" && (
        <>
          <SummaryBar
            name={form.values.name || "Untitled"}
            designerName={resolvedDesignerName}
            statusLabel={STATUS_CONFIG[form.values.status]?.label ?? "Unstarted"}
            stitchCount={effectiveStitchCount}
            onDetailsClick={handleDetailsClick}
          />
          <div className="mx-auto max-w-[720px] px-5 pb-20">
            <div className="mt-4">
              <CalculatorCard
                calcParams={calcParams}
                onCalcParamsChange={setCalcParams}
                fabricId={form.values.fabricId}
                onFabricChange={(id, count) => {
                  form.setField("fabricId", id);
                  if (count) setCalcParams((prev) => ({ ...prev, fabricCount: count }));
                }}
                fabricOptions={fabricOptions}
              />
            </div>
            <div className="mt-4">
              <SupplyTable
                threads={supplyRows.filter((r) => r.type === "THREAD")}
                beads={supplyRows.filter((r) => r.type === "BEAD")}
                specialty={supplyRows.filter((r) => r.type === "SPECIALTY")}
                adapter={adapterRef.current!}
                calcParams={calcParams}
                existingSupplyIds={new Set(supplyRows.map((r) => r.supplyId))}
              />
            </div>
          </div>
        </>
      )}

      <StickySaveBar
        chartName={form.values.name}
        onSubmit={form.submitForm}
        isSubmitting={form.isPending}
        mode={formMode}
        {...(!isEdit && {
          onSaveDraft: handleSaveDraft,
          isSavingDraft: isSavingDraft,
          saveDraftLabel: saveDraftLabel,
        })}
      />
    </>
  );
}
