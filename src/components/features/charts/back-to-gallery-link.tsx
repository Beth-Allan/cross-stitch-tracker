"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const VIEW_STORAGE_KEY = "gallery-view-mode";
const VALID_VIEWS = new Set(["gallery", "list", "table"]);

export function BackToGalleryLink() {
  const [href, setHref] = useState("/charts");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(VIEW_STORAGE_KEY);
      if (stored && VALID_VIEWS.has(stored) && stored !== "gallery") {
        setHref(`/charts?view=${stored}`);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 text-sm transition-colors"
    >
      <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
      Projects
    </Link>
  );
}
