"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import type { Designer, Fabric, FabricBrand, Genre } from "@/generated/prisma/client";
import type { ProjectStatus } from "@/generated/prisma/client";
import type { ChartWithProject } from "@/types/chart";
import type { StorageLocationWithStats, StitchingAppWithStats } from "@/types/storage";
import { useChartForm } from "./use-chart-form";
import { BasicInfoSection } from "./sections/basic-info-section";
import { StitchCountSection } from "./sections/stitch-count-section";
import { GenreSection } from "./sections/genre-section";
import { PatternTypeSection } from "./sections/pattern-type-section";
import { ProjectSetupSection } from "./sections/project-setup-section";
import { DatesSection } from "./sections/dates-section";
import { GoalsSection } from "./sections/goals-section";
import { NotesSection } from "./sections/notes-section";

type Tab = "basic" | "details";

interface ChartEditModalProps {
  chart: ChartWithProject;
  designers: Designer[];
  genres: Genre[];
  storageLocations: StorageLocationWithStats[];
  stitchingApps: StitchingAppWithStats[];
  unassignedFabrics: (Fabric & { brand: FabricBrand })[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function ChartEditModal({
  chart,
  designers,
  genres,
  storageLocations,
  stitchingApps,
  unassignedFabrics,
  open,
  onOpenChange,
  onSuccess,
}: ChartEditModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>("basic");

  const form = useChartForm({
    mode: "edit",
    initialData: chart,
    designers,
    genres,
    storageLocations,
    stitchingApps,
    onSuccess: () => {
      onOpenChange(false);
      onSuccess?.();
    },
  });

  const [discardOpen, setDiscardOpen] = useState(false);

  const handleClose = () => {
    if (form.isDirty) {
      setDiscardOpen(true);
      return;
    }
    onOpenChange(false);
  };

  const handleDiscardConfirm = () => {
    setDiscardOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
        <DialogContent
          showCloseButton={false}
          className="border-border/60 flex max-h-[90vh] w-full max-w-2xl flex-col border p-0"
        >
          {/* Header */}
          <DialogHeader className="px-6 pt-5">
            <div className="flex items-center justify-between">
              <DialogTitle className="font-fraunces text-foreground text-xl font-semibold">
                Edit Chart
              </DialogTitle>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleClose}
                aria-label="Close dialog"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </Button>
            </div>
          </DialogHeader>

          {/* Tab bar */}
          <div
            role="tablist"
            aria-label="Edit chart sections"
            className="border-border mt-4 flex gap-0 border-b px-6"
          >
            <button
              type="button"
              role="tab"
              id="chart-edit-basic-tab"
              aria-selected={activeTab === "basic"}
              aria-controls="chart-edit-basic-panel"
              onClick={() => setActiveTab("basic")}
              className={`border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === "basic"
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Basic Info
            </button>
            <button
              type="button"
              role="tab"
              id="chart-edit-details-tab"
              aria-selected={activeTab === "details"}
              aria-controls="chart-edit-details-panel"
              onClick={() => setActiveTab("details")}
              className={`ml-6 border-b-2 px-1 pb-2 text-sm font-medium transition-colors ${
                activeTab === "details"
                  ? "border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground border-transparent"
              }`}
            >
              Details
            </button>
          </div>

          {/* Form wraps tab content + footer so submit button works */}
          <form onSubmit={form.handleSubmit} className="flex min-h-0 flex-1 flex-col">
            {/* Tab content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {activeTab === "basic" ? (
                <div
                  role="tabpanel"
                  id="chart-edit-basic-panel"
                  aria-labelledby="chart-edit-basic-tab"
                  className="space-y-5"
                >
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
                </div>
              ) : (
                <div
                  role="tabpanel"
                  id="chart-edit-details-panel"
                  aria-labelledby="chart-edit-details-tab"
                  className="space-y-5"
                >
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
                    storageLocationId={form.values.storageLocationId}
                    stitchingAppId={form.values.stitchingAppId}
                    fabricId={form.values.fabricId}
                    storageLocations={form.storageLocationsList}
                    stitchingApps={form.stitchingAppsList}
                    unassignedFabrics={unassignedFabrics}
                    needsOnionSkinning={form.values.needsOnionSkinning}
                    onStatusChange={(v) => form.setField("status", v as ProjectStatus)}
                    onStorageLocationChange={(v) => form.setField("storageLocationId", v)}
                    onStitchingAppChange={(v) => form.setField("stitchingAppId", v)}
                    onFabricChange={(v) => form.setField("fabricId", v)}
                    onOnionSkinningChange={(v) => form.setField("needsOnionSkinning", v)}
                    onAddStorageLocation={form.handleAddStorageLocation}
                    onAddStitchingApp={form.handleAddStitchingApp}
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

                  <NotesSection
                    notes={form.values.notes}
                    onNotesChange={(v) => form.setField("notes", v)}
                  />
                </div>
              )}

              {form.errors._form && (
                <p role="alert" className="text-destructive mt-4 text-sm">
                  {form.errors._form}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="border-border flex justify-end gap-3 border-t px-6 py-4">
              <Button type="button" variant="ghost" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.isSubmitDisabled}>
                {form.isSuccess ? "Saved!" : form.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Discard changes confirmation */}
      <Dialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>You have unsaved changes that will be lost.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDiscardOpen(false)} autoFocus>
              Keep Editing
            </Button>
            <Button variant="destructive" onClick={handleDiscardConfirm}>
              Discard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
