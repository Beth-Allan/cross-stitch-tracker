"use client";

import { useCallback, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validations/upload";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "complete" | "error";

interface CoverImageUploadProps {
  chartId?: string;
  currentImageUrl?: string | null;
  onUploadComplete: (key: string) => void;
  onRemove: () => void;
}

export function CoverImageUpload({
  chartId,
  currentImageUrl,
  onUploadComplete,
  onRemove,
}: CoverImageUploadProps) {
  const [state, setState] = useState<UploadState>(currentImageUrl ? "complete" : "idle");
  const [preview, setPreview] = useState<string | null>(currentImageUrl ?? null);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return "Invalid file type. Please upload a PNG, JPG, or WebP image.";
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
          category: "covers",
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

        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        setState("complete");
        onUploadComplete(result.key);
      } catch {
        setError("Upload failed. Please try again.");
        setState("error");
      }
    },
    [chartId, onUploadComplete, validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        void uploadFile(file);
      }
    },
    [uploadFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        void uploadFile(file);
      }
      // Reset so the same file can be re-selected
      e.target.value = "";
    },
    [uploadFile],
  );

  const handleRemove = useCallback(() => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setState("idle");
    setError(null);
    onRemove();
  }, [preview, onRemove]);

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openFilePicker();
      }
    },
    [openFilePicker],
  );

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        aria-hidden="true"
      />

      {state === "complete" && preview ? (
        <div className="relative h-32 overflow-hidden rounded-lg border-2 border-stone-200 dark:border-stone-700">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Cover image preview" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
            aria-label="Remove cover image"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload cover image"
          onClick={openFilePicker}
          onKeyDown={handleKeyDown}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          className={cn(
            "flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isDragOver
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-stone-700 dark:hover:border-emerald-500 dark:hover:bg-emerald-950/20",
            state === "error" && "border-destructive",
          )}
        >
          {state === "uploading" ? (
            <>
              <Loader2 className="mb-2 size-6 animate-spin text-stone-400" />
              <span className="text-sm text-stone-500 dark:text-stone-400">Uploading...</span>
            </>
          ) : state === "error" ? (
            <div className="text-center">
              <p className="text-destructive text-sm">{error}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setState("idle");
                  setError(null);
                }}
                className="text-destructive mt-1 text-xs underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <>
              <Upload className="mb-2 size-6 text-stone-400" strokeWidth={1.5} />
              <span className="text-sm text-stone-500 dark:text-stone-400">
                Drop an image here or click to upload
              </span>
              <span className="text-xs text-stone-400">PNG, JPG up to 5MB</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
