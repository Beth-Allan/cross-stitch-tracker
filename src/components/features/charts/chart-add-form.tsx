"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Designer, Genre } from "@/generated/prisma/client";
import type { ProjectStatus } from "@/generated/prisma/client";
import { useChartForm } from "./use-chart-form";
import { BasicInfoSection } from "./sections/basic-info-section";
import { StitchCountSection } from "./sections/stitch-count-section";
import { GenreSection } from "./sections/genre-section";
import { PatternTypeSection } from "./sections/pattern-type-section";
import { ProjectSetupSection } from "./sections/project-setup-section";
import { DatesSection } from "./sections/dates-section";
import { GoalsSection } from "./sections/goals-section";
import { NotesSection } from "./sections/notes-section";

interface ChartAddFormProps {
  designers: Designer[];
  genres: Genre[];
}

export function ChartAddForm({ designers, genres }: ChartAddFormProps) {
  const router = useRouter();

  const form = useChartForm({
    mode: "create",
    designers,
    genres,
    onSuccess: () => {
      router.push("/charts");
    },
  });

  const handleCancel = () => {
    if (form.isDirty) {
      if (!window.confirm("You have unsaved changes. Leave anyway?")) return;
    }
    router.push("/charts");
  };

  return (
    <div className="mx-auto max-w-2xl p-5 lg:p-8">
      <Link
        href="/charts"
        className="group text-muted-foreground hover:text-foreground mb-4 inline-flex items-center gap-1 text-sm transition-colors"
      >
        <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-0.5" />
        Charts
      </Link>

      <h1 className="font-fraunces text-foreground mb-6 text-2xl font-semibold">Add New Chart</h1>

      <form onSubmit={form.handleSubmit} className="space-y-5">
        <BasicInfoSection
          name={form.values.name}
          designerId={form.values.designerId}
          coverImageUrl={form.values.coverImageUrl}
          digitalFileUrl={form.values.digitalFileUrl}
          designers={form.designers}
          onNameChange={(v) => form.setField("name", v)}
          onDesignerChange={(v) => form.setField("designerId", v)}
          onCoverImageChange={(key) => form.setField("coverImageUrl", key)}
          onCoverImageRemove={() => {
            form.setField("coverImageUrl", null);
            form.setField("coverThumbnailUrl", null);
          }}
          onDigitalFileChange={(key) => form.setField("digitalFileUrl", key)}
          onDigitalFileRemove={() => form.setField("digitalFileUrl", null)}
          onAddDesigner={form.handleAddDesigner}
          errors={{
            name: form.errors["chart.name"],
          }}
        />

        <StitchCountSection
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

        <GenreSection
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

        <PatternTypeSection
          isPaperChart={form.values.isPaperChart}
          isFormalKit={form.values.isFormalKit}
          isSAL={form.values.isSAL}
          kitColorCount={form.values.kitColorCount}
          onFormatChange={(isPaper) => form.setField("isPaperChart", isPaper)}
          onFormalKitChange={(checked) => form.setField("isFormalKit", checked)}
          onSALChange={(checked) => form.setField("isSAL", checked)}
          onKitColorCountChange={(v) =>
            form.setField("kitColorCount", v ? parseInt(v) || null : null)
          }
          errors={{
            kitColorCount: form.errors["chart.kitColorCount"],
          }}
        />

        <ProjectSetupSection
          status={form.values.status}
          projectBin={form.values.projectBin}
          ipadApp={form.values.ipadApp}
          needsOnionSkinning={form.values.needsOnionSkinning}
          onStatusChange={(v) => form.setField("status", v as ProjectStatus)}
          onBinChange={(v) => form.setField("projectBin", v)}
          onAppChange={(v) => form.setField("ipadApp", v)}
          onOnionSkinningChange={(v) => form.setField("needsOnionSkinning", v)}
          errors={{
            status: form.errors["project.status"],
          }}
        />

        <DatesSection
          startDate={form.values.startDate}
          finishDate={form.values.finishDate}
          ffoDate={form.values.ffoDate}
          onStartDateChange={(v) => form.setField("startDate", v)}
          onFinishDateChange={(v) => form.setField("finishDate", v)}
          onFfoDateChange={(v) => form.setField("ffoDate", v)}
          errors={{
            startDate: form.errors["project.startDate"],
            finishDate: form.errors["project.finishDate"],
            ffoDate: form.errors["project.ffoDate"],
          }}
        />

        <GoalsSection
          wantToStartNext={form.values.wantToStartNext}
          preferredStartSeason={form.values.preferredStartSeason}
          onWantToStartChange={(v) => form.setField("wantToStartNext", v)}
          onPreferenceChange={(v) => form.setField("preferredStartSeason", v)}
        />

        <NotesSection notes={form.values.notes} onNotesChange={(v) => form.setField("notes", v)} />

        {form.errors._form && (
          <p role="alert" className="text-destructive text-sm">
            {form.errors._form}
          </p>
        )}

        <div className="border-border mt-8 flex justify-end gap-3 border-t pt-5">
          <Button type="button" variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={form.isSubmitDisabled}>
            {form.isSuccess ? "Added!" : form.isPending ? "Adding..." : "Add Chart"}
          </Button>
        </div>
      </form>
    </div>
  );
}
