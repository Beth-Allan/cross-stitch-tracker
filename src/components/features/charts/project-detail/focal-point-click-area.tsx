"use client";

import { CropGuideOverlay } from "./crop-guide-overlay";
import { FocalPointMarker } from "./focal-point-marker";

interface FocalPointClickAreaProps {
  pendingPoint: { x: number; y: number } | null;
  containerSize: { width: number; height: number };
  onImageClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Click overlay for focal point placement. Renders as absolute inset-0
 * on top of the hero image. Separated from FocalPointEditor so the
 * action bar can render in normal document flow below the image.
 */
export function FocalPointClickArea({
  pendingPoint,
  containerSize,
  onImageClick,
  onKeyDown,
  containerRef,
}: FocalPointClickAreaProps) {
  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-10 cursor-crosshair"
      role="button"
      tabIndex={0}
      aria-label="Click to place focal point"
      onClick={onImageClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onKeyDown(e);
        } else {
          onKeyDown(e);
        }
      }}
    >
      {pendingPoint && containerSize.width > 0 && (
        <>
          <CropGuideOverlay
            focalPointX={pendingPoint.x}
            focalPointY={pendingPoint.y}
            containerWidth={containerSize.width}
            containerHeight={containerSize.height}
          />
          <FocalPointMarker x={pendingPoint.x} y={pendingPoint.y} />
        </>
      )}
    </div>
  );
}
