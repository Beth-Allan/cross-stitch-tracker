"use client";

interface CropGuideOverlayProps {
  focalX: number; // 0-1 normalized
  focalY: number; // 0-1 normalized
  containerWidth: number; // px
  containerHeight: number; // px
}

/**
 * 4:3 aspect ratio crop preview overlay centered on the focal point.
 * Shows what the gallery card crop will look like.
 * Uses box-shadow trick for dimming outside the crop area.
 */
export function CropGuideOverlay({
  focalX,
  focalY,
  containerWidth,
  containerHeight,
}: CropGuideOverlayProps) {
  // 60% of container width, max 360px (mobile: 70%)
  const guideWidth = Math.min(containerWidth * 0.6, 360);
  const guideHeight = guideWidth * (3 / 4); // 4:3 aspect ratio

  // Center on focal point, clamp to container bounds
  let left = focalX * containerWidth - guideWidth / 2;
  let top = focalY * containerHeight - guideHeight / 2;
  left = Math.max(0, Math.min(containerWidth - guideWidth, left));
  top = Math.max(0, Math.min(containerHeight - guideHeight, top));

  return (
    <div
      className="pointer-events-none absolute z-10 border-2 border-dashed border-white/80 transition-all duration-100 ease-out"
      style={{
        left: `${left}px`,
        top: `${top}px`,
        width: `${guideWidth}px`,
        height: `${guideHeight}px`,
        boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
        background: "transparent",
      }}
    >
      {/* Label: 11px semibold uppercase tracking-wider, top-left inside guide */}
      <span className="absolute top-1 left-1 text-[11px] font-semibold uppercase tracking-wider text-white">
        Gallery preview
      </span>
    </div>
  );
}
