"use client";

import { useState, useTransition, useRef, useCallback, useEffect } from "react";
import { Crosshair } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { updateFocalPoint } from "@/lib/actions/focal-point-actions";
import { FocalPointClickArea } from "./focal-point-click-area";

interface FocalPointEditorProps {
  chartId: string;
  initialFocalPoint: { x: number; y: number } | null;
  imageUrl: string | null;
}

/**
 * Focal point editor for the hero banner.
 * Provides click-to-set interface with crosshair marker, crop guide preview,
 * and save/cancel/reset controls. Renders as a Fragment with:
 *   - Edit button (absolute, top-right) when not in edit mode
 *   - FocalPointClickArea (absolute inset-0) when in edit mode
 *   - Action bar (normal flow, below image) when in edit mode
 */
export function FocalPointEditor({ chartId, initialFocalPoint, imageUrl }: FocalPointEditorProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [pendingPoint, setPendingPoint] = useState<{
    x: number;
    y: number;
  } | null>(initialFocalPoint);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isEditMode || !containerRef.current) return;
    const el = containerRef.current;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      setContainerSize({ width: rect.width, height: rect.height });
    };
    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isEditMode]);

  const handleImageClick = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!isEditMode) return;
      const target = event.currentTarget;
      const rect = target.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (event.clientY - rect.top) / rect.height));
      setPendingPoint({ x, y });
    },
    [isEditMode],
  );

  function handleEnterEditMode() {
    setIsEditMode(true);
    setPendingPoint(initialFocalPoint);
  }

  function handleSave() {
    if (!pendingPoint) return;
    startTransition(async () => {
      try {
        const result = await updateFocalPoint(chartId, pendingPoint.x, pendingPoint.y);
        if (result.success) {
          setIsEditMode(false);
          toast.success("Focal point saved");
        } else {
          toast.error(result.error ?? "Couldn't save focal point. Try again.");
        }
      } catch (error) {
        console.error("Focal point save failed:", error);
        toast.error("Couldn't save focal point. Try again.");
      }
    });
  }

  function handleCancel() {
    setPendingPoint(initialFocalPoint);
    setIsEditMode(false);
  }

  function handleReset() {
    startTransition(async () => {
      try {
        const result = await updateFocalPoint(chartId, null, null);
        if (result.success) {
          setPendingPoint(null);
          setIsEditMode(false);
          toast.success("Focal point reset");
        } else {
          toast.error(result.error ?? "Couldn't reset focal point. Try again.");
        }
      } catch (error) {
        console.error("Focal point reset failed:", error);
        toast.error("Couldn't reset focal point. Try again.");
      }
    });
  }

  function handleKeyDown(event: React.KeyboardEvent) {
    if (event.key === "Escape" && isEditMode) {
      handleCancel();
    }
  }

  if (!imageUrl) return null;

  return (
    <>
      {!isEditMode && (
        <button
          onClick={handleEnterEditMode}
          className="absolute top-2 right-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
          aria-label="Set focal point for cover image"
          title="Set Focal Point"
        >
          <Crosshair className="h-3.5 w-3.5" />
        </button>
      )}

      {isEditMode && (
        <FocalPointClickArea
          pendingPoint={pendingPoint}
          containerSize={containerSize}
          onImageClick={handleImageClick}
          onKeyDown={handleKeyDown}
          containerRef={containerRef}
        />
      )}

      {isEditMode && (
        <div
          className="border-border bg-card/90 animate-in slide-in-from-bottom-1 flex items-center gap-2 border-t p-2 backdrop-blur-sm duration-200"
          onKeyDown={handleKeyDown}
        >
          <Button size="sm" onClick={handleSave} disabled={isPending || !pendingPoint}>
            {isPending ? "Saving..." : "Save"}
          </Button>
          <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
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

      <div aria-live="polite" className="sr-only">
        {pendingPoint &&
          `Focal point set at ${Math.round(pendingPoint.x * 100)}%, ${Math.round(pendingPoint.y * 100)}%`}
      </div>
    </>
  );
}
