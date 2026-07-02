"use client";

import { useState } from "react";
import Image from "next/image";
import { FocalPointEditor } from "./focal-point-editor";

interface HeroCoverBannerProps {
  imageUrl: string | null;
  chartName: string;
  chartId: string;
  focalPointX: number | null;
  focalPointY: number | null;
}

/**
 * Full-width cover banner for the project detail hero.
 * Renders the cover image with object-contain over a blurred background
 * fill for visual weight. Returns null when no image.
 *
 * overflow-hidden is on the inner image wrapper so the focal point
 * action bar (rendered by FocalPointEditor) appears below the image
 * in normal document flow and is not clipped.
 */
export function HeroCoverBanner({
  imageUrl,
  chartName,
  chartId,
  focalPointX,
  focalPointY,
}: HeroCoverBannerProps) {
  const [imgError, setImgError] = useState(false);

  if (!imageUrl || imgError) return null;

  return (
    <div className="bg-muted group relative w-full rounded-lg">
      <div className="max-h-64 overflow-hidden rounded-lg max-[767px]:max-h-40 md:max-h-48">
        <Image
          src={imageUrl}
          alt=""
          fill
          aria-hidden="true"
          className="scale-110 object-cover opacity-60 blur-[20px]"
          unoptimized
        />
        <Image
          src={imageUrl}
          alt={`Cover for ${chartName}`}
          width={1200}
          height={800}
          priority
          className="relative mx-auto max-h-64 w-full object-contain max-[767px]:max-h-40 md:max-h-48"
          onError={() => setImgError(true)}
          unoptimized
        />
      </div>
      <FocalPointEditor
        chartId={chartId}
        initialFocalPoint={
          focalPointX != null && focalPointY != null ? { x: focalPointX, y: focalPointY } : null
        }
        imageUrl={imageUrl}
      />
    </div>
  );
}
