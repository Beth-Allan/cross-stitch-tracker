"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Camera, ChevronDown, Search } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createSession, updateSession, deleteSession } from "@/lib/actions/session-actions";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import type { ActiveProjectForPicker } from "@/types/session";

// ─── Types ──────────────────────────────────────────────────────────────────

interface EditSessionData {
  id: string;
  projectId: string;
  date: string;
  stitchCount: number;
  timeSpentMinutes: number | null;
  photoKey: string | null;
}

export interface LogSessionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  activeProjects: ActiveProjectForPicker[];
  imageUrls: Record<string, string>;
  editSession?: EditSessionData | null;
  lockedProjectId?: string;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function LogSessionModal({
  isOpen,
  onOpenChange,
  activeProjects,
  imageUrls,
  editSession,
  lockedProjectId,
}: LogSessionModalProps) {
  const isEditing = !!editSession;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Form State ─────────────────────────────────────────────────────────

  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [date, setDate] = useState(todayString());
  const [stitchCount, setStitchCount] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // ─── UI State ───────────────────────────────────────────────────────────

  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ─── Close project dropdown on outside click ───────────────────────────

  useEffect(() => {
    if (!showProjectDropdown) return;
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowProjectDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProjectDropdown]);

  // ─── Reset form when modal opens/closes or editSession changes ──────────

  useEffect(() => {
    if (!isOpen) return;

    if (editSession) {
      setSelectedProjectId(editSession.projectId);
      setDate(editSession.date);
      setStitchCount(String(editSession.stitchCount));
      if (editSession.timeSpentMinutes != null) {
        setHours(String(Math.floor(editSession.timeSpentMinutes / 60)));
        setMinutes(String(editSession.timeSpentMinutes % 60));
      } else {
        setHours("");
        setMinutes("");
      }
      setPhotoKey(editSession.photoKey);
    } else {
      setSelectedProjectId(lockedProjectId ?? "");
      setDate(todayString());
      setStitchCount("");
      setHours("");
      setMinutes("");
      setPhotoKey(null);
      setPhotoPreview(null);
    }
    setProjectSearch("");
    setShowDeleteConfirm(false);
    setShowProjectDropdown(false);
  }, [isOpen, editSession, lockedProjectId]);

  // ─── Derived State ──────────────────────────────────────────────────────

  const selectedProject = activeProjects.find((p) => p.projectId === selectedProjectId);
  const filteredProjects = activeProjects.filter((p) =>
    p.chartName.toLowerCase().includes(projectSearch.toLowerCase()),
  );

  const parsedStitchCount = parseInt(stitchCount, 10);
  const isValid = !!selectedProjectId && !isNaN(parsedStitchCount) && parsedStitchCount >= 1;

  const totalMinutes = (parseInt(hours, 10) || 0) * 60 + (parseInt(minutes, 10) || 0);

  // ─── Photo Upload ───────────────────────────────────────────────────────

  async function handlePhotoUpload(file: File) {
    setIsUploading(true);
    try {
      const result = await getPresignedUploadUrl({
        category: "sessions",
        projectId: selectedProjectId,
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
      });

      if (!result.success) {
        toast.error("Photo upload failed. Your session was saved without the photo.");
        return;
      }

      const response = await fetch(result.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!response.ok) {
        toast.error("Photo upload failed. Your session was saved without the photo.");
        return;
      }

      setPhotoKey(result.key);
      setPhotoPreview(URL.createObjectURL(file));
    } catch {
      toast.error("Photo upload failed. Your session was saved without the photo.");
    } finally {
      setIsUploading(false);
    }
  }

  function handlePhotoClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handlePhotoUpload(file);
    }
  }

  // ─── Save ───────────────────────────────────────────────────────────────

  function handleSave() {
    if (!isValid) return;

    const formData = {
      projectId: selectedProjectId,
      date,
      stitchCount: parsedStitchCount,
      timeSpentMinutes: totalMinutes > 0 ? totalMinutes : null,
      photoKey,
    };

    startTransition(async () => {
      try {
        if (isEditing && editSession) {
          const result = await updateSession(editSession.id, formData);
          if (result.success) {
            toast.success("Session updated");
            onOpenChange(false);
            return;
          }
          toast.error(
            "Session could not be saved. Check that stitch count is a positive number and a project is selected.",
          );
        } else {
          const result = await createSession(formData);
          if (result.success) {
            toast.success("Session logged");
            onOpenChange(false);
            return;
          }
          toast.error(
            "Session could not be saved. Check that stitch count is a positive number and a project is selected.",
          );
        }
      } catch {
        toast.error("Session could not be saved. Check your connection and try again.");
      }
    });
  }

  // ─── Delete ─────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!editSession) return;

    startTransition(async () => {
      try {
        const result = await deleteSession(editSession.id);
        if (result.success) {
          toast.success("Session deleted");
          onOpenChange(false);
          return;
        }
        toast.error("Session could not be deleted. Check your connection and try again.");
      } catch {
        toast.error("Session could not be deleted. Check your connection and try again.");
      }
    });
  }

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Session" : "Log Stitches"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Project Picker */}
          {!lockedProjectId && (
            <div ref={dropdownRef} className="relative">
              <label
                htmlFor="project-picker-trigger"
                className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase"
              >
                Project
              </label>
              <button
                id="project-picker-trigger"
                type="button"
                onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                className="border-input flex h-8 w-full items-center justify-between rounded-lg border bg-transparent px-2.5 py-1 text-sm"
              >
                <span className={selectedProject ? "text-foreground" : "text-muted-foreground"}>
                  {selectedProject?.chartName ?? "Select a project..."}
                </span>
                <ChevronDown className="text-muted-foreground h-4 w-4 shrink-0" />
              </button>

              {showProjectDropdown && (
                <div className="bg-popover border-border absolute top-full right-0 left-0 z-10 mt-1 max-h-56 overflow-hidden rounded-lg border shadow-xl">
                  <div className="border-border border-b p-2">
                    <div className="relative">
                      <Search className="text-muted-foreground absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search projects..."
                        value={projectSearch}
                        onChange={(e) => setProjectSearch(e.target.value)}
                        className="bg-muted border-input w-full rounded-md border py-1.5 pr-3 pl-8 text-sm outline-none focus:ring-1 focus:ring-emerald-500/40"
                        autoFocus
                      />
                    </div>
                  </div>
                  <div className="max-h-44 overflow-y-auto">
                    {filteredProjects.map((project) => (
                      <button
                        key={project.projectId}
                        type="button"
                        onClick={() => {
                          setSelectedProjectId(project.projectId);
                          setShowProjectDropdown(false);
                          setProjectSearch("");
                        }}
                        className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${
                          project.projectId === selectedProjectId
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
                            : "text-foreground"
                        }`}
                      >
                        {/* 28px thumbnail */}
                        <div className="bg-muted h-7 w-7 shrink-0 overflow-hidden rounded">
                          {project.coverThumbnailUrl && imageUrls[project.coverThumbnailUrl] ? (
                            <img
                              src={imageUrls[project.coverThumbnailUrl]}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-[9px]">
                              ?
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium">{project.chartName}</p>
                          <p className="text-muted-foreground text-[11px]">
                            {project.totalStitches > 0
                              ? `${Math.round((project.stitchesCompleted / project.totalStitches) * 100)}% complete`
                              : "0% complete"}
                          </p>
                        </div>
                      </button>
                    ))}
                    {filteredProjects.length === 0 && (
                      <p className="text-muted-foreground px-3 py-4 text-center text-sm">
                        No matching projects
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Date Field */}
          <div>
            <label
              htmlFor="session-date"
              className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase"
            >
              Date
            </label>
            <Input
              id="session-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
            <p className="text-muted-foreground mt-1 text-sm">
              Defaults to today. Change to backfill older sessions.
            </p>
          </div>

          {/* Stitch Count */}
          <div>
            <label
              htmlFor="session-stitch-count"
              className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase"
            >
              Stitch Count
            </label>
            <Input
              id="session-stitch-count"
              type="number"
              min={1}
              value={stitchCount}
              onChange={(e) => setStitchCount(e.target.value)}
              placeholder="e.g. 423"
            />
            <p className="text-muted-foreground mt-1 text-sm">
              Number of stitches completed this session
            </p>
          </div>

          {/* Time Spent (optional) */}
          <div>
            <span className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Time Spent{" "}
              <span className="text-muted-foreground/70 tracking-normal normal-case">
                (optional)
              </span>
            </span>
            <div className="flex items-center gap-2">
              <Input
                aria-label="Hours"
                type="number"
                min={0}
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="0"
                className="w-20 text-center"
              />
              <span className="text-muted-foreground text-xs">hrs</span>
              <Input
                aria-label="Minutes"
                type="number"
                min={0}
                max={59}
                value={minutes}
                onChange={(e) => setMinutes(e.target.value)}
                placeholder="0"
                className="w-20 text-center"
              />
              <span className="text-muted-foreground text-xs">min</span>
            </div>
          </div>

          {/* Photo Upload (optional) */}
          <div>
            <span className="text-muted-foreground mb-1.5 block text-xs font-semibold tracking-wider uppercase">
              Progress Photo{" "}
              <span className="text-muted-foreground/70 tracking-normal normal-case">
                (optional)
              </span>
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            {photoPreview || photoKey ? (
              <div className="flex items-center gap-3">
                <div className="border-border h-12 w-12 overflow-hidden rounded-lg border">
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Session photo preview"
                      className="h-full w-full object-cover"
                    />
                  ) : photoKey && imageUrls[photoKey] ? (
                    <img
                      src={imageUrls[photoKey]}
                      alt="Session photo"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-muted flex h-full w-full items-center justify-center">
                      <Camera className="text-muted-foreground h-4 w-4" />
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handlePhotoClick}
                  className="text-xs text-emerald-600 hover:underline dark:text-emerald-400"
                >
                  Replace photo
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handlePhotoClick}
                disabled={isUploading}
                className="border-border text-muted-foreground flex w-full items-center justify-center gap-2 rounded-lg border border-dashed px-3 py-2 text-sm transition-colors hover:border-emerald-400 hover:text-emerald-600 dark:hover:border-emerald-600 dark:hover:text-emerald-400"
              >
                <Camera className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Add progress photo"}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="sm:justify-between">
          {/* Left side: delete link (edit mode only) */}
          <div className="flex items-center">
            {isEditing && !showDeleteConfirm && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive text-xs transition-colors hover:opacity-80"
              >
                Delete session
              </button>
            )}
            {isEditing && showDeleteConfirm && (
              <div className="flex items-center gap-2">
                <span className="text-destructive text-xs">Delete?</span>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isPending}
                  className="h-6 px-2 text-xs"
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="h-6 px-2 text-xs"
                >
                  No
                </Button>
              </div>
            )}
          </div>

          {/* Right side: dismiss + save */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
              {isEditing ? "Discard Changes" : "Discard"}
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isValid || isPending}
              className="disabled:opacity-40"
            >
              {isEditing ? "Save Changes" : "Log Stitches"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
