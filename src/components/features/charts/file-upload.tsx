"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/validations/upload";
import { Button } from "@/components/ui/button";

type UploadState = "idle" | "uploading" | "complete" | "error";

interface FileUploadProps {
  chartId?: string;
  currentFileUrl?: string | null;
  currentFileName?: string | null;
  onUploadComplete: (key: string, fileName: string) => void;
  onRemove: () => void;
}

export function FileUpload({
  chartId,
  currentFileUrl,
  currentFileName,
  onUploadComplete,
  onRemove,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>(currentFileName ? "complete" : "idle");
  const [fileName, setFileName] = useState<string | null>(currentFileName ?? null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type as (typeof ALLOWED_FILE_TYPES)[number])) {
      return "Invalid file type. Please upload a PDF, PNG, JPG, or WebP file.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 5MB.";
    }
    return null;
  }, []);

  const uploadFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setState("error");
        return;
      }

      setState("uploading");
      setError(null);

      try {
        const result = await getPresignedUploadUrl({
          fileName: file.name,
          contentType: file.type,
          category: "files",
          projectId: chartId,
        });

        if ("success" in result && !result.success) {
          setError(result.error);
          setState("error");
          return;
        }

        if (!("url" in result)) {
          setError("Failed to get upload URL.");
          setState("error");
          return;
        }

        await fetch(result.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        setFileName(file.name);
        setState("complete");
        onUploadComplete(result.key, file.name);
      } catch {
        setError("Upload failed. Please try again.");
        setState("error");
      }
    },
    [chartId, onUploadComplete, validateFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleRemove = useCallback(() => {
    setFileName(null);
    setState("idle");
    setError(null);
    onRemove();
  }, [onRemove]);

  // Suppress unused variable warning -- currentFileUrl reserved for download link in future
  void currentFileUrl;

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_FILE_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {state === "complete" && fileName ? (
        <div className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 dark:border-stone-700">
          <FileText className="size-4 shrink-0 text-stone-500" />
          <span className="flex-1 truncate text-sm text-stone-700 dark:text-stone-300">
            {fileName}
          </span>
          <button
            type="button"
            onClick={handleRemove}
            className="rounded p-0.5 text-stone-400 transition-colors hover:text-stone-600 dark:hover:text-stone-300"
            aria-label="Remove file"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-1">
          <Button
            type="button"
            variant="outline"
            disabled={state === "uploading"}
            onClick={() => inputRef.current?.click()}
          >
            {state === "uploading" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="size-4" />
                Upload Working Copy
              </>
            )}
          </Button>
          {state === "error" && error && <p className="text-destructive text-xs">{error}</p>}
        </div>
      )}
    </div>
  );
}
