"use client";

import { useRef, useState, useTransition } from "react";
import { Files } from "lucide-react";
import { toast } from "sonner";
import { InfoCard } from "@/components/features/charts/info-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { ChartFileRow, type ChartFileRowFile } from "./chart-file-row";
import { DeleteFileDialog } from "./delete-file-dialog";
import { deleteChartFile, getChartFileDownloadUrl } from "@/lib/actions/chart-file-actions";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import { addChartFile } from "@/lib/actions/chart-file-actions";
import {
  ALLOWED_CHART_FILE_TYPES,
  ALLOWED_CHART_FILE_EXTENSIONS,
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_LABEL,
} from "@/lib/validations/upload";

interface ChartFileListProps {
  chartId: string;
  files: Array<{
    id: string;
    url: string;
    filename: string;
    mimeType: string;
    fileSize: number;
    label: string | null;
    notes: string | null;
    createdAt: Date;
  }>;
}

export function ChartFileList({ chartId, files }: ChartFileListProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [deleteTarget, setDeleteTarget] = useState<ChartFileRowFile | null>(null);
  const [isUploading, startUploadTransition] = useTransition();

  // Sort files newest first
  const sortedFiles = [...files].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  function handleAddFilesClick() {
    fileInputRef.current?.click();
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    startUploadTransition(async () => {
      for (const file of Array.from(selectedFiles)) {
        // Validate file type
        if (
          !ALLOWED_CHART_FILE_TYPES.includes(file.type as (typeof ALLOWED_CHART_FILE_TYPES)[number])
        ) {
          const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
          if (
            !ALLOWED_CHART_FILE_EXTENSIONS.includes(
              ext as (typeof ALLOWED_CHART_FILE_EXTENSIONS)[number],
            )
          ) {
            toast.error(`Unsupported file type. Accepted: PDF, images, .pat, .xsd, .css, .saga`);
            continue;
          }
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File exceeds ${MAX_FILE_SIZE_LABEL} limit.`);
          continue;
        }

        try {
          // Get presigned URL
          const presignedResult = await getPresignedUploadUrl({
            fileName: file.name,
            contentType: file.type || "application/octet-stream",
            fileSize: file.size,
            category: "files",
            projectId: chartId,
          });

          if (!presignedResult.success) {
            toast.error(presignedResult.error || "Upload failed. Please try again.");
            continue;
          }

          // Upload to R2
          const response = await fetch(presignedResult.url, {
            method: "PUT",
            body: file,
            headers: { "Content-Type": file.type || "application/octet-stream" },
          });
          if (!response.ok) {
            toast.error("Upload failed. Please try again.");
            continue;
          }

          // Record in database
          // Size and type are read back from the stored object by the server —
          // what this component knows about the file is not evidence.
          const addResult = await addChartFile({
            chartId,
            url: presignedResult.key,
            filename: file.name,
            label: null,
          });

          if (!addResult.success) {
            toast.error(addResult.error || "Failed to save file record.");
            continue;
          }

          toast.success(`Uploaded ${file.name}`);
        } catch (error) {
          console.error("Chart file upload failed:", error);
          toast.error("Upload failed. Please try again.");
        }
      }
    });

    // Reset input so the same file can be re-selected
    e.target.value = "";
  }

  async function handleDownload(fileId: string) {
    try {
      const result = await getChartFileDownloadUrl(fileId);
      if (!result.success) {
        toast.error(result.error || "Failed to get download URL.");
        return;
      }
      // PDFs open in new tab; others trigger download
      if (result.mimeType === "application/pdf") {
        window.open(result.url, "_blank");
      } else {
        const a = document.createElement("a");
        a.href = result.url;
        a.download = result.filename;
        a.target = "_blank";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Download chart file failed:", error);
      toast.error("Failed to download file.");
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    const result = await deleteChartFile(deleteTarget.id);
    if (!result.success) {
      toast.error(result.error || "Failed to delete file.");
      throw new Error(result.error); // Keep dialog open
    }
    toast.success(`Deleted ${deleteTarget.filename}`);
    setDeleteTarget(null);
  }

  const acceptString = ALLOWED_CHART_FILE_EXTENSIONS.join(",");

  return (
    <>
      <InfoCard
        icon={Files}
        title="Working Copies"
        action={
          <Button variant="outline" size="sm" onClick={handleAddFilesClick} disabled={isUploading}>
            {isUploading ? "Uploading..." : "Add Files"}
          </Button>
        }
      >
        {sortedFiles.length === 0 ? (
          <EmptyState
            icon={Files}
            title="No working copies yet"
            description="Upload your digital pattern files — PDFs, images, or cross-stitch software files."
          >
            <Button variant="outline" onClick={handleAddFilesClick} disabled={isUploading}>
              Upload Files
            </Button>
          </EmptyState>
        ) : (
          <div className="divide-border divide-y">
            {sortedFiles.map((file) => (
              <ChartFileRow
                key={file.id}
                file={file}
                onDownload={handleDownload}
                onDelete={(id) => {
                  const target = sortedFiles.find((f) => f.id === id);
                  if (target) setDeleteTarget(target);
                }}
              />
            ))}
          </div>
        )}
      </InfoCard>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={acceptString}
        className="hidden"
        aria-label="Upload working copy files"
        onChange={handleFileInputChange}
      />

      <DeleteFileDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        filename={deleteTarget?.filename ?? ""}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
