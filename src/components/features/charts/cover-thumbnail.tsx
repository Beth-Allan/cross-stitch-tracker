"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Image as ImageIcon } from "lucide-react";

interface CoverThumbnailProps {
  url: string | null;
  name: string;
}

export function CoverThumbnail({ url, name }: CoverThumbnailProps) {
  const [imgError, setImgError] = useState(false);

  if (url && !imgError) {
    return (
      <NextImage
        src={url}
        alt={`Cover for ${name}`}
        width={40}
        height={40}
        className="h-10 w-10 shrink-0 rounded-lg object-cover"
        onError={() => setImgError(true)}
        unoptimized
      />
    );
  }

  return (
    <div className="bg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
      <ImageIcon className="text-muted-foreground/60 h-4 w-4" strokeWidth={1.5} />
    </div>
  );
}
