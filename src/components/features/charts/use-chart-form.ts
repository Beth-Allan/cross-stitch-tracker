"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { SizeCategory } from "@/lib/utils/size-category";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import { chartFormSchema } from "@/lib/validations/chart";
import { toast } from "sonner";
import { createChart, createChartWithSupplies, updateChart } from "@/lib/actions/chart-actions";
import type { SupplyRow } from "@/components/features/supply-table/types";
import { createDesigner } from "@/lib/actions/designer-actions";
import { createGenre } from "@/lib/actions/genre-actions";
import { createStorageLocation } from "@/lib/actions/storage-location-actions";
import { createStitchingApp } from "@/lib/actions/stitching-app-actions";
import { createSeries } from "@/lib/actions/series-actions";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import type { SeriesWithStats } from "@/types/series";
import { z } from "zod";

export interface ChartFormValues {
  name: string;
  designerId: string | null;
  seriesId: string | null;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  uploadedFiles: Array<{ key: string; filename: string; mimeType: string; fileSize: number }>;
  stitchesWide: number;
  stitchesHigh: number;
  stitchCount: number;
  stitchCountApproximate: boolean;
  genreIds: string[];
  isPaperChart: boolean;
  isFormalKit: boolean;
  kitColorCount: number | null;
  isSAL: boolean;
  notes: string;
  status: ProjectStatus;
  storageLocationId: string | null;
  stitchingAppId: string | null;
  fabricId: string | null;
  needsOnionSkinning: boolean;
  startDate: string;
  finishDate: string;
  ffoDate: string;
  wantToStartNext: boolean;
  preferredStartSeason: string | null;
  startingStitches: number;
}

interface UseChartFormOptions {
  mode: "create" | "edit";
  initialData?: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  storageLocations?: StorageLocationWithStats[];
  stitchingApps?: StitchingAppWithStats[];
  series?: SeriesWithStats[];
  onSuccess: (chartId: string) => void;
  getSupplyRows?: () => SupplyRow[];
  onValidationError?: () => void;
}

const ERROR_MAP: Record<string, string> = {
  "chart.name": "Chart name is required",
  "chart.stitchCount": "Enter a stitch count or both width and height",
  "chart.kitColorCount": "Kit color count must be a positive number",
  "project.status": "Please select a status",
  "project.startDate": "Invalid date format",
  "project.finishDate": "Invalid date format",
  "project.ffoDate": "Invalid date format",
};

function formatErrors(zodError: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of zodError.issues) {
    const path = issue.path.join(".");
    errors[path] = ERROR_MAP[path] ?? "This field has an error";
  }
  return errors;
}

function buildInitialValues(data?: ChartWithProject): ChartFormValues {
  if (!data) {
    return {
      name: "",
      designerId: null,
      seriesId: null,
      coverImageUrl: null,
      coverThumbnailUrl: null,
      uploadedFiles: [],
      stitchesWide: 0,
      stitchesHigh: 0,
      stitchCount: 0,
      stitchCountApproximate: false,
      genreIds: [],
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
  }

  const project = data.project;
  return {
    name: data.name,
    designerId: data.designerId,
    seriesId: data.seriesId,
    coverImageUrl: data.coverImageUrl,
    coverThumbnailUrl: data.coverThumbnailUrl,
    uploadedFiles: [],
    stitchesWide: data.stitchesWide,
    stitchesHigh: data.stitchesHigh,
    stitchCount:
      data.stitchesWide > 0 &&
      data.stitchesHigh > 0 &&
      data.stitchCount === data.stitchesWide * data.stitchesHigh
        ? 0
        : data.stitchCount,
    stitchCountApproximate: data.stitchCountApproximate,
    genreIds: data.genres.map((g) => g.id),
    isPaperChart: data.isPaperChart,
    isFormalKit: data.isFormalKit,
    kitColorCount: data.kitColorCount,
    isSAL: data.isSAL,
    notes: data.notes ?? "",
    status: (project?.status ?? "UNSTARTED") as ProjectStatus,
    storageLocationId: project?.storageLocationId ?? null,
    stitchingAppId: project?.stitchingAppId ?? null,
    fabricId: project?.fabric?.id ?? null,
    needsOnionSkinning: project?.needsOnionSkinning ?? false,
    startDate: project?.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
    finishDate: project?.finishDate ? new Date(project.finishDate).toISOString().split("T")[0] : "",
    ffoDate: project?.ffoDate ? new Date(project.ffoDate).toISOString().split("T")[0] : "",
    wantToStartNext: project?.wantToStartNext ?? false,
    preferredStartSeason: project?.preferredStartSeason ?? null,
    startingStitches: project?.startingStitches ?? 0,
  };
}

export function useChartForm({
  mode,
  initialData,
  designers: initialDesigners,
  genres: initialGenres,
  storageLocations: initialStorageLocations = [],
  stitchingApps: initialStitchingApps = [],
  series: initialSeries = [],
  onSuccess,
  getSupplyRows,
  onValidationError,
}: UseChartFormOptions) {
  const initial = useMemo(() => buildInitialValues(initialData), [initialData]);
  const [values, setValues] = useState<ChartFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isSubmitDisabled = isPending || isSuccess;
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [storageLocationsList, setStorageLocationsList] =
    useState<StorageLocationWithStats[]>(initialStorageLocations);
  const [stitchingAppsList, setStitchingAppsList] =
    useState<StitchingAppWithStats[]>(initialStitchingApps);
  const [seriesList, setSeriesList] = useState<SeriesWithStats[]>(initialSeries);

  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initial);
  }, [values, initial]);

  const { count: effectiveStitchCount, approximate: isAutoCalculated } = useMemo(
    () => getEffectiveStitchCount(values.stitchCount, values.stitchesWide, values.stitchesHigh),
    [values.stitchCount, values.stitchesWide, values.stitchesHigh],
  );

  const sizeCategory: SizeCategory | null = useMemo(
    () => (effectiveStitchCount > 0 ? calculateSizeCategory(effectiveStitchCount) : null),
    [effectiveStitchCount],
  );

  const setField = useCallback(
    <K extends keyof ChartFormValues>(key: K, value: ChartFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Clear errors for this field -- check both chart.X and project.X paths
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`chart.${key}`];
        delete updated[`project.${key}`];
        return updated;
      });
    },
    [],
  );

  const suppressUnloadRef = useRef(false);

  const submitForm = useCallback(async () => {
    const formData = {
      chart: {
        name: values.name,
        designerId: values.designerId,
        seriesId: values.seriesId,
        coverImageUrl: values.coverImageUrl,
        coverThumbnailUrl: values.coverThumbnailUrl,
        fileKeys: values.uploadedFiles,
        stitchCount: values.stitchCount,
        stitchCountApproximate: values.stitchCountApproximate,
        stitchesWide: values.stitchesWide,
        stitchesHigh: values.stitchesHigh,
        genreIds: values.genreIds,
        isPaperChart: values.isPaperChart,
        isFormalKit: values.isFormalKit,
        isSAL: values.isSAL,
        kitColorCount: values.isFormalKit ? values.kitColorCount : null,
        notes: values.notes || null,
      },
      project: {
        status: values.status,
        storageLocationId: values.storageLocationId,
        stitchingAppId: values.stitchingAppId,
        fabricId: values.fabricId,
        needsOnionSkinning: values.needsOnionSkinning,
        startDate: values.startDate || null,
        finishDate: values.finishDate || null,
        ffoDate: values.ffoDate || null,
        wantToStartNext: values.wantToStartNext,
        preferredStartSeason: values.preferredStartSeason,
        startingStitches: values.startingStitches,
      },
    };

    const result = chartFormSchema.safeParse(formData);
    if (!result.success) {
      const formatted = formatErrors(result.error);
      setErrors(formatted);
      const firstError = Object.values(formatted)[0];
      if (firstError) toast.error(firstError);
      onValidationError?.();
      return;
    }

    setIsPending(true);
    suppressUnloadRef.current = true;
    try {
      if (mode === "create") {
        const supplyRows = getSupplyRows?.() ?? [];
        let response;
        if (supplyRows.length > 0) {
          const supplyPayload = {
            threads: supplyRows
              .filter((r) => r.type === "THREAD")
              .map((r) => ({
                supplyId: r.supplyId,
                stitchCount: r.stitchCount,
                need: r.need,
                isNeedOverridden: r.isNeedOverridden,
              })),
            beads: supplyRows
              .filter((r) => r.type === "BEAD")
              .map((r) => ({
                supplyId: r.supplyId,
                need: r.need,
              })),
            specialty: supplyRows
              .filter((r) => r.type === "SPECIALTY")
              .map((r) => ({
                supplyId: r.supplyId,
                need: r.need,
              })),
          };
          response = await createChartWithSupplies(formData, supplyPayload);
        } else {
          response = await createChart(formData);
        }
        if (!response.success) {
          setErrors({ _form: response.error });
          suppressUnloadRef.current = false;
          return;
        }
        if (response.warning) {
          toast.warning(response.warning);
        }
        setIsSuccess(true);
        onSuccess(response.chartId);
      } else {
        const response = await updateChart(initialData!.id, formData);
        if (!response.success) {
          setErrors({ _form: response.error });
          suppressUnloadRef.current = false;
          return;
        }
        if (response.warning) {
          toast.warning(response.warning);
        }
        setIsSuccess(true);
        onSuccess(initialData!.id);
      }
    } catch (error) {
      console.error("Chart form submission error:", error);
      setErrors({ _form: "An unexpected error occurred" });
      suppressUnloadRef.current = false;
    } finally {
      setIsPending(false);
    }
  }, [values, mode, initialData, onSuccess, getSupplyRows, onValidationError]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      await submitForm();
    },
    [submitForm],
  );

  const handleAddDesigner = useCallback(
    async (name: string, website?: string) => {
      suppressUnloadRef.current = true;
      try {
        const result = await createDesigner({
          name,
          website: website ?? null,
        });
        if (!result.success) {
          throw new Error(result.error);
        }
        setDesigners((prev) => [...prev, result.designer]);
        setField("designerId", result.designer.id);
      } finally {
        suppressUnloadRef.current = false;
      }
    },
    [setField],
  );

  const handleAddGenre = useCallback(async (name: string) => {
    suppressUnloadRef.current = true;
    try {
      const result = await createGenre({ name });
      if (!result.success) {
        throw new Error(result.error);
      }
      setGenres((prev) => [...prev, result.genre]);
      setValues((prev) => ({
        ...prev,
        genreIds: [...prev.genreIds, result.genre.id],
      }));
    } finally {
      suppressUnloadRef.current = false;
    }
  }, []);

  const handleAddStorageLocation = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      suppressUnloadRef.current = true;
      try {
        const result = await createStorageLocation({ name: name.trim() });
        if (!result.success) throw new Error(result.error);
        const newItem: StorageLocationWithStats = {
          id: result.location.id,
          name: result.location.name,
          description: result.location.description,
          projectCount: 0,
        };
        setStorageLocationsList((prev) => [...prev, newItem]);
        setField("storageLocationId", result.location.id);
      } finally {
        suppressUnloadRef.current = false;
      }
    },
    [setField],
  );

  const handleAddStitchingApp = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      suppressUnloadRef.current = true;
      try {
        const result = await createStitchingApp({ name: name.trim() });
        if (!result.success) throw new Error(result.error);
        const newItem: StitchingAppWithStats = {
          id: result.app.id,
          name: result.app.name,
          description: result.app.description,
          projectCount: 0,
        };
        setStitchingAppsList((prev) => [...prev, newItem]);
        setField("stitchingAppId", result.app.id);
      } finally {
        suppressUnloadRef.current = false;
      }
    },
    [setField],
  );

  const handleAddSeries = useCallback(
    async (name: string) => {
      if (!name.trim()) return;
      suppressUnloadRef.current = true;
      try {
        const result = await createSeries({ name: name.trim(), designerId: values.designerId });
        if (!result.success) {
          throw new Error(result.error);
        }
        const newItem: SeriesWithStats = {
          id: result.series.id,
          name: result.series.name,
          totalCount: result.series.totalCount,
          designerId: result.series.designerId,
          designerName: result.series.designerName,
          notes: result.series.notes,
          progress: { ownedCount: 0, finishedCount: 0, totalCount: result.series.totalCount },
        };
        setSeriesList((prev) => [...prev, newItem]);
        setField("seriesId", result.series.id);
      } finally {
        suppressUnloadRef.current = false;
      }
    },
    [setField, values.designerId],
  );

  useEffect(() => {
    if (!isDirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      if (suppressUnloadRef.current) return;
      e.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return {
    values,
    setField,
    effectiveStitchCount,
    sizeCategory,
    isAutoCalculated,
    errors,
    isPending,
    isSuccess,
    isSubmitDisabled,
    isDirty,
    handleSubmit,
    submitForm,
    designers,
    genres,
    handleAddDesigner,
    handleAddGenre,
    storageLocationsList,
    stitchingAppsList,
    seriesList,
    handleAddStorageLocation,
    handleAddStitchingApp,
    handleAddSeries,
  };
}
