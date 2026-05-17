"use client";

interface FocalPointMarkerProps {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
}

/**
 * Visual crosshair marker positioned at the focal point.
 * 24px diameter circle with bg-primary fill, white border, and crosshair lines.
 * Decorative only — position is announced via aria-live region in the parent editor.
 */
export function FocalPointMarker({ x, y }: FocalPointMarkerProps) {
  return (
    <div
      className="pointer-events-none absolute z-20 transition-all duration-100 ease-out"
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        transform: "translate(-50%, -50%)",
      }}
      aria-hidden="true"
    >
      {/* Crosshair lines extending 8px beyond the 12px radius circle (N/S/E/W) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        {/* Vertical line */}
        <div className="absolute left-1/2 -top-5 h-10 w-0.5 -translate-x-1/2 bg-white" />
        {/* Horizontal line */}
        <div className="absolute top-1/2 -left-5 h-0.5 w-10 -translate-y-1/2 bg-white" />
      </div>
      {/* Center circle: 24px diameter, emerald fill at 80%, white border, shadow, scale animation */}
      <div className="h-6 w-6 rounded-full border-2 border-white bg-primary/80 shadow-[0_1px_3px_rgba(0,0,0,0.3)] animate-in zoom-in-0 duration-150" />
    </div>
  );
}
