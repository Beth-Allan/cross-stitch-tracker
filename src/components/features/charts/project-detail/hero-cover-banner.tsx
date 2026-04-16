"use client";

import { useState } from "react";

interface HeroCoverBannerProps {
  imageUrl: string | null;
  chartName: string;
}

/**
 * Full-width cover banner for the project detail hero.
 * Renders the cover image with object-contain (never crop per D-01)
 * over a blurred background fill for visual weight.
 * Returns null when no image (per D-02: compact metadata-forward layout).
 */
export function HeroCoverBanner({ imageUrl, chartName }: HeroCoverBannerProps) {
  const [imgError, setImgError] = useState(false);

  // D-02: Skip banner entirely when no cover image
  if (!imageUrl || imgError) return null;

  return (
    <div className="bg-muted relative max-h-64 w-full overflow-hidden rounded-lg max-[767px]:max-h-40 md:max-h-48">
      {/* Blurred background fill (per RESEARCH.md Pitfall 1: use filter:blur on <img>, NOT backdrop-filter) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-[20px]"
      />
      {/* Foreground image with object-contain (D-01: never crop) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`Cover for ${chartName}`}
        className="relative mx-auto max-h-64 w-full object-contain max-[767px]:max-h-40 md:max-h-48"
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
      />
    </div>
  );
}
