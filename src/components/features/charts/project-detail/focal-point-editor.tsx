"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { Crosshair } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateFocalPoint } from "@/lib/actions/focal-point-actions";
import { FocalPointMarker } from "./focal-point-marker";
import { CropGuideOverlay } from "./crop-guide-overlay";

interface FocalPointEditorProps {
  chartId: string;
  initialFocalPointX: number | null;
  initialFocalPointY: number | null;
  imageUrl: string | null;
}

/**
 * Focal point editor overlay for the hero banner.
 * Provides click-to-set interface with crosshair marker, crop guide preview,
 * and save/cancel/reset controls. Renders as overlay elements on top of the
 * hero image — does NOT render the image itself.
 */
export function FocalPointEditor({
  chartId,
  initialFocalPointX,
  initialFocalPointY,
  imageUrl,
}: FocalPointEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{
    x: number;
    y: number;
  } | null>(
    initialFocalPointX != null && initialFocalPointY != null
      ? { x: initialFocalPointX, y: initialFocalPointY }
      : null,
  );
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  // Measure container size on edit mode entry
  useEffect(() => {
    if (isEditMode && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    }
  }, [isEditMode]);

  const handleImageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditMode) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = Math.max(
        0,
        Math.min(1, (event.clientX - rect.left) / rect.width),
      );
      const y = Math.max(
        0,
        Math.min(1, (event.clientY - rect.top) / rect.height),
      );
      setPendingPoint({ x, y });
    },
    [isEditMode],
  );

  function handleEnterEditMode() {
    setIsEditMode(true);
    setPendingPoint(
      initialFocalPointX != null && initialFocalPointY != null
        ? { x: initialFocalPointX, y: initialFocalPointY }
        : null,
    );
  }

  function handleSave() {
    if (!pendingPoint) return;
    startTransition(async () => {
      try {
        const result = await updateFocalPoint(
          chartId,
          pendingPoint.x,
          pendingPoint.y,
        );
        if (result.success) {
          setIsEditMode(false);
          toast.success("Focal point saved");
        } else {
          toast.error("Couldn't save focal point. Try again.");
        }
      } catch {
        toast.error("Couldn't save focal point. Try again.");
      }
    });
  }

  function handleCancel() {
    setPendingPoint(
      initialFocalPointX != null && initialFocalPointY != null
        ? { x: initialFocalPointX, y: initialFocalPointY }
        : null,
    );
    setIsEditMode(false);
  }

  function handleReset() {
    startTransition(async () => {
      try {
        const result = await updateFocalPoint(chartId, null, null);
        if (result.success) {
          setPendingPoint(null);
          setIsEditMode(false);
          toast.success("Focal point saved");
        } else {
          toast.error("Couldn't save focal point. Try again.");
        }
      } catch {
        toast.error("Couldn't save focal point. Try again.");
      }
    });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && isEditMode) {
      handleCancel();
    }
  }

  // No image = no editor
  if (!imageUrl) return null;

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div onKeyDown={handleKeyDown}>
      {/* Edit mode trigger button — top-right of hero banner */}
      {!isEditMode && (
        <button
          onClick={handleEnterEditMode}
          className="absolute top-2 right-2 z-10 flex min-h-12 min-w-12 items-center gap-1.5 rounded-lg bg-black/60 px-2 py-1.5 text-white backdrop-blur-sm hover:bg-black/70 md:px-3"
          aria-label="Set focal point for cover image"
        >
          <Crosshair className="h-4 w-4" />
          <span className="hidden text-sm md:inline">Set Focal Point</span>
        </button>
      )}

      {/* Edit mode: click area overlay + marker + crop guide */}
      {isEditMode && (
        <div
          ref={containerRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          role="button"
          tabIndex={0}
          aria-label="Click to place focal point"
          onClick={handleImageClick}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              // Let click handler deal with mouse events only
            }
          }}
        >
          {pendingPoint && containerSize.width > 0 && (
            <>
              <CropGuideOverlay
                focalX={pendingPoint.x}
                focalY={pendingPoint.y}
                containerWidth={containerSize.width}
                containerHeight={containerSize.height}
              />
              <FocalPointMarker x={pendingPoint.x} y={pendingPoint.y} />
            </>
          )}
        </div>
      )}

      {/* Action bar — below the image, in layout flow */}
      {isEditMode && (
        <div className="absolute right-0 bottom-0 left-0 z-20 mt-2 flex items-center gap-2 rounded-b-lg border-t border-border bg-card/90 p-2 backdrop-blur-sm animate-in slide-in-from-bottom-1 duration-200">
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isPending || !pendingPoint}
          >
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCancel}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleReset}
            disabled={isPending}
            className="ml-auto"
          >
            Reset to Center
          </Button>
        </div>
      )}

      {/* Screen reader announcement for focal point placement */}
      <div aria-live="polite" className="sr-only">
        {pendingPoint &&
          `Focal point set at ${Math.round(pendingPoint.x * 100)}%, ${Math.round(pendingPoint.y * 100)}%`}
      </div>
    </div>
  );
}
