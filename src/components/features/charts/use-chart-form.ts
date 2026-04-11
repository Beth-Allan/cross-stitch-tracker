"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Designer, Genre, ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { SizeCategory } from "@/lib/utils/size-category";
import { calculateSizeCategory, getEffectiveStitchCount } from "@/lib/utils/size-category";
import { chartFormSchema } from "@/lib/validations/chart";
import { createChart, updateChart } from "@/lib/actions/chart-actions";
import { createDesigner } from "@/lib/actions/designer-actions";
import { createGenre } from "@/lib/actions/genre-actions";
import { z } from "zod";

export interface ChartFormValues {
  name: string;
  designerId: string | null;
  coverImageUrl: string | null;
  coverThumbnailUrl: string | null;
  digitalFileUrl: string | null;
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
  projectBin: string | null;
  ipadApp: string | null;
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
  onSuccess: (chartId: string) => void;
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
      coverImageUrl: null,
      coverThumbnailUrl: null,
      digitalFileUrl: null,
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
      projectBin: null,
      ipadApp: null,
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
    coverImageUrl: data.coverImageUrl,
    coverThumbnailUrl: data.coverThumbnailUrl,
    digitalFileUrl: data.digitalWorkingCopyUrl,
    stitchesWide: data.stitchesWide,
    stitchesHigh: data.stitchesHigh,
    stitchCount: data.stitchCount,
    stitchCountApproximate: data.stitchCountApproximate,
    genreIds: data.genres.map((g) => g.id),
    isPaperChart: data.isPaperChart,
    isFormalKit: data.isFormalKit,
    kitColorCount: data.kitColorCount,
    isSAL: data.isSAL,
    notes: data.notes ?? "",
    status: (project?.status ?? "UNSTARTED") as ProjectStatus,
    projectBin: project?.projectBin ?? null,
    ipadApp: project?.ipadApp ?? null,
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
  onSuccess,
}: UseChartFormOptions) {
  const initial = useMemo(() => buildInitialValues(initialData), [initialData]);
  const [values, setValues] = useState<ChartFormValues>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const isSubmitDisabled = isPending || isSuccess;
  const [designers, setDesigners] = useState<Designer[]>(initialDesigners);
  const [genres, setGenres] = useState<Genre[]>(initialGenres);

  // Dirty tracking
  const isDirty = useMemo(() => {
    return JSON.stringify(values) !== JSON.stringify(initial);
  }, [values, initial]);

  // Computed stitch count values
  const { count: effectiveStitchCount, approximate: isAutoCalculated } = useMemo(
    () => getEffectiveStitchCount(values.stitchCount, values.stitchesWide, values.stitchesHigh),
    [values.stitchCount, values.stitchesWide, values.stitchesHigh],
  );

  const sizeCategory: SizeCategory | null = useMemo(
    () => (effectiveStitchCount > 0 ? calculateSizeCategory(effectiveStitchCount) : null),
    [effectiveStitchCount],
  );

  // Clear field error when value changes
  const setField = useCallback(
    <K extends keyof ChartFormValues>(key: K, value: ChartFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      // Clear errors for this field — check both chart.X and project.X paths
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[`chart.${key}`];
        delete updated[`project.${key}`];
        return updated;
      });
    },
    [],
  );

  // Submit
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const formData = {
        chart: {
          name: values.name,
          designerId: values.designerId,
          coverImageUrl: values.coverImageUrl,
          coverThumbnailUrl: values.coverThumbnailUrl,
          digitalFileUrl: values.digitalFileUrl,
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
          projectBin: values.projectBin,
          ipadApp: values.ipadApp,
          needsOnionSkinning: values.needsOnionSkinning,
          startDate: values.startDate || null,
          finishDate: values.finishDate || null,
          ffoDate: values.ffoDate || null,
          wantToStartNext: values.wantToStartNext,
          preferredStartSeason: values.preferredStartSeason,
          startingStitches: values.startingStitches,
        },
      };

      // Client-side validation
      const result = chartFormSchema.safeParse(formData);
      if (!result.success) {
        setErrors(formatErrors(result.error));
        return;
      }

      setIsPending(true);
      suppressUnloadRef.current = true;
      try {
        if (mode === "create") {
          const response = await createChart(formData);
          if (!response.success) {
            setErrors({ _form: response.error });
            suppressUnloadRef.current = false;
            return;
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
          setIsSuccess(true);
          onSuccess(initialData!.id);
        }
      } catch {
        setErrors({ _form: "An unexpected error occurred" });
        suppressUnloadRef.current = false;
      } finally {
        setIsPending(false);
      }
    },
    [values, mode, initialData, onSuccess],
  );

  // Inline entity creation
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

  // Suppress beforeunload during inline entity creation (server action revalidation can trigger it)
  const suppressUnloadRef = useRef(false);

  // Beforeunload warning
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
    designers,
    genres,
    handleAddDesigner,
    handleAddGenre,
  };
}
