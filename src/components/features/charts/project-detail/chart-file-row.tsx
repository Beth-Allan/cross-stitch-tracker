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
      className="group hover:bg-muted flex min-h-10 cursor-pointer items-center gap-2 rounded-sm px-2 py-2 sm:flex-row"
      onClick={() => onDownload(file.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDownload(file.id);
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Open ${file.filename}`}
    >
      <FileTypeIcon mimeType={file.mimeType} filename={file.filename} />

      <div className="flex min-w-0 flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-2">
        <span className="min-w-0 flex-1 truncate text-sm">{file.label || file.filename}</span>
        <span className="text-muted-foreground text-xs">{formatFileSize(file.fileSize)}</span>
      </div>

      <button
        type="button"
        aria-label={`Download ${file.filename}`}
        className="hover:bg-accent inline-flex size-8 items-center justify-center rounded-md"
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
        className="text-muted-foreground hover:bg-accent hover:text-destructive inline-flex size-8 items-center justify-center rounded-md"
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
