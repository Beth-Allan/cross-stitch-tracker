"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import {
  ALLOWED_CHART_FILE_EXTENSIONS,
  ALLOWED_CHART_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/lib/validations/upload";
import { Button } from "@/components/ui/button";
import { formatFileSize } from "@/lib/utils/format-file-size";

export interface UploadedFile {
  key: string;
  filename: string;
  mimeType: string;
  fileSize: number;
}

interface ChartFileUploadProps {
  chartId?: string;
  uploadedFiles: UploadedFile[];
  onFilesChange: (files: UploadedFile[]) => void;
}

type FileUploadState = "uploading" | "error";

interface InProgressFile {
  id: string;
  filename: string;
  state: FileUploadState;
  error?: string;
}

function validateFile(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  const isValidExtension = (ALLOWED_CHART_FILE_EXTENSIONS as readonly string[]).includes(ext);
  const isValidMime = (ALLOWED_CHART_FILE_TYPES as readonly string[]).includes(file.type);

  if (!isValidExtension && !isValidMime) {
    return "Unsupported file type. Accepted: PDF, images, .pat, .xsd, .css, .saga, .zip";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "File exceeds 50MB limit.";
  }

  return null;
}

let fileIdCounter = 0;
function generateFileId(): string {
  fileIdCounter += 1;
  return `upload-${fileIdCounter}-${Date.now()}`;
}

export function ChartFileUpload({ chartId, uploadedFiles, onFilesChange }: ChartFileUploadProps) {
  const [inProgress, setInProgress] = useState<InProgressFile[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const isUploading = inProgress.some((f) => f.state === "uploading");

  const handleRemove = useCallback(
    (key: string) => {
      onFilesChange(uploadedFiles.filter((f) => f.key !== key));
    },
    [uploadedFiles, onFilesChange],
  );

  const uploadSingleFile = useCallback(
    async (file: File, localId: string) => {
      try {
        const result = await getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type || "application/octet-stream",
          fileSize: file.size,
          category: "files",
          projectId: chartId || "unsaved",
        });

        if ("success" in result && !result.success) {
          setInProgress((prev) =>
            prev.map((f) =>
              f.id === localId
                ? { ...f, state: "error" as const, error: "Upload failed. Please try again." }
                : f,
            ),
          );
          return null;
        }

        if (!("url" in result)) {
          setInProgress((prev) =>
            prev.map((f) =>
              f.id === localId
                ? { ...f, state: "error" as const, error: "Upload failed. Please try again." }
                : f,
            ),
          );
          return null;
        }

        const uploadResponse = await fetch(result.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type || "application/octet-stream" },
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

        return {
          key: result.key,
          filename: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSize: file.size,
        } satisfies UploadedFile;
      } catch {
        setInProgress((prev) =>
          prev.map((f) =>
            f.id === localId
              ? { ...f, state: "error" as const, error: "Upload failed. Please try again." }
              : f,
          ),
        );
        return null;
      }
    },
    [chartId],
  );

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      e.target.value = "";

      if (selectedFiles.length === 0) return;

      // Validate all files first
      const errors: string[] = [];
      const validFiles: File[] = [];

      for (const file of selectedFiles) {
        const error = validateFile(file);
        if (error) {
          errors.push(error);
        } else {
          validFiles.push(file);
        }
      }

      // Show unique errors
      const uniqueErrors = [...new Set(errors)];
      setValidationErrors(uniqueErrors);

      if (validFiles.length === 0) return;

      // Clear validation errors for valid files
      if (errors.length === 0) {
        setValidationErrors([]);
      }

      // Start uploading valid files
      const newInProgress: InProgressFile[] = validFiles.map((file) => ({
        id: generateFileId(),
        filename: file.name,
        state: "uploading" as const,
      }));

      setInProgress((prev) => [...prev, ...newInProgress]);

      // Upload each file
      const results: UploadedFile[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const uploaded = await uploadSingleFile(validFiles[i], newInProgress[i].id);
        if (uploaded) {
          results.push(uploaded);
          // Remove from in-progress
          setInProgress((prev) => prev.filter((f) => f.id !== newInProgress[i].id));
        }
      }

      if (results.length > 0) {
        onFilesChange([...uploadedFiles, ...results]);
      }
    },
    [uploadedFiles, onFilesChange, uploadSingleFile],
  );

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ALLOWED_CHART_FILE_EXTENSIONS.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-label="Upload working copy files"
      />

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Uploading...
          </>
        ) : (
          <>
            <Upload className="size-4" />
            Upload Working Copies
          </>
        )}
      </Button>

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div aria-live="polite">
          {validationErrors.map((error, i) => (
            <p key={i} className="text-destructive text-xs">
              {error}
            </p>
          ))}
        </div>
      )}

      {/* In-progress uploads */}
      {inProgress.map((file) => (
        <div
          key={file.id}
          className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
        >
          {file.state === "uploading" && (
            <Loader2 className="text-muted-foreground size-4 shrink-0 animate-spin" />
          )}
          <span className="text-foreground flex-1 truncate text-sm">{file.filename}</span>
          {file.state === "error" && file.error && (
            <span className="text-destructive text-xs">{file.error}</span>
          )}
        </div>
      ))}

      {/* Completed files */}
      {uploadedFiles.map((file) => (
        <div
          key={file.key}
          className="border-border flex items-center gap-2 rounded-lg border px-3 py-2"
        >
          <span className="text-foreground flex-1 truncate text-sm">{file.filename}</span>
          <span className="text-muted-foreground text-xs">{formatFileSize(file.fileSize)}</span>
          <button
            type="button"
            onClick={() => handleRemove(file.key)}
            className="text-muted-foreground hover:text-foreground rounded p-0.5 transition-colors"
            aria-label={`Remove ${file.filename}`}
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
