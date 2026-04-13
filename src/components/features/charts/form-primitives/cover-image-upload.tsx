"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Upload, X } from "lucide-react";
import { getPresignedUploadUrl, getPresignedDownloadUrl } from "@/lib/actions/upload-actions";
import { ALLOWED_IMAGE_TYPES, MAX_FILE_SIZE } from "@/lib/validations/upload";
import { cn } from "@/lib/utils";

type UploadState = "idle" | "uploading" | "complete" | "error" | "resolving";

/** Check if a URL string looks like an R2 object key (not a displayable URL). */
function isR2Key(url: string): boolean {
  return !url.startsWith("http") && !url.startsWith("blob:") && !url.startsWith("data:");
}

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
  const needsResolving = !!currentImageUrl && isR2Key(currentImageUrl);
  const [state, setState] = useState<UploadState>(
    needsResolving ? "resolving" : currentImageUrl ? "complete" : "idle",
  );
  const [preview, setPreview] = useState<string | null>(
    needsResolving ? null : (currentImageUrl ?? null),
  );
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgError, setImgError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve R2 key to presigned URL on mount when editing an existing chart
  useEffect(() => {
    if (!currentImageUrl || !isR2Key(currentImageUrl)) return;

    let cancelled = false;
    async function resolve() {
      try {
        const result = await getPresignedDownloadUrl(currentImageUrl!);
        if (cancelled) return;
        if (result.success) {
          setPreview(result.url);
          setState("complete");
        } else {
          setError("Could not load cover image");
          setState("idle");
        }
      } catch {
        if (!cancelled) {
          setError("Could not load cover image");
          setState("idle");
        }
      }
    }
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [currentImageUrl]);

  const validateFile = useCallback((file: File): string | null => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      return "Invalid file type. Please upload a PNG, JPG, or WebP image.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File is too large. Maximum size is 10MB.";
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
          fileSize: file.size,
          category: "covers",
          projectId: chartId || "unsaved",
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

        const uploadResponse = await fetch(result.url, {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });

        if (!uploadResponse.ok) {
          throw new Error("Upload failed");
        }

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

      {state === "resolving" ? (
        <div className="border-border flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
          <Loader2 className="text-muted-foreground/50 size-6 animate-spin" />
        </div>
      ) : state === "complete" && preview && !imgError ? (
        <div className="border-border bg-muted relative h-48 overflow-hidden rounded-lg border-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Cover image preview"
            className="h-full w-full object-contain"
            onError={() => setImgError(true)}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
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
            "flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors",
            isDragOver
              ? "border-primary bg-primary/10"
              : "border-border hover:border-primary/50 hover:bg-primary/5",
            state === "error" && "border-destructive",
          )}
        >
          {state === "uploading" ? (
            <>
              <Loader2 className="text-muted-foreground/50 mb-2 size-6 animate-spin" />
              <span className="text-muted-foreground text-sm">Uploading...</span>
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
              <Upload className="text-muted-foreground/50 mb-2 size-6" strokeWidth={1.5} />
              <span className="text-muted-foreground text-sm">
                Drop an image here or click to upload
              </span>
              <span className="text-muted-foreground/70 text-xs">PNG, JPG up to 10MB</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
