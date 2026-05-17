"use client";

import { Download, Trash2 } from "lucide-react";
import { FileTypeIcon } from "./file-type-icon";
import { formatFileSize } from "@/lib/utils/format-file-size";

export interface ChartFileRowFile {
  id: string;
  filename: string;
  mimeType: string;
  fileSize: number;
  label: string | null;
  createdAt: Date;
}

interface ChartFileRowProps {
  file: ChartFileRowFile;
  onDelete: (id: string) => void;
  onDownload: (id: string) => void;
}

export function ChartFileRow({ file, onDelete, onDownload }: ChartFileRowProps) {
  return (
    <div
      className="group flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-2 py-2 hover:bg-muted sm:flex-row"
      onClick={() => onDownload(file.id)}
      role="link"
      aria-label={`Open ${file.filename}`}
    >
      <FileTypeIcon mimeType={file.mimeType} filename={file.filename} />

      {/* Filename + metadata: stacks on mobile, inline on desktop */}
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="min-w-0 flex-1 truncate text-sm">
          {file.label || file.filename}
        </span>
        <span className="text-muted-foreground text-xs">
          {formatFileSize(file.fileSize)}
        </span>
      </div>

      {/* Action buttons */}
      <button
        type="button"
        aria-label={`Download ${file.filename}`}
        className="inline-flex size-8 items-center justify-center rounded-md hover:bg-accent"
        onClick={(e) => {
          e.stopPropagation();
          onDownload(file.id);
        }}
      >
        <Download className="size-4" />
      </button>
      <button
        type="button"
        aria-label={`Delete ${file.filename}`}
        className="text-muted-foreground inline-flex size-8 items-center justify-center rounded-md hover:bg-accent hover:text-destructive"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(file.id);
        }}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
}
