import { File, FileCode, FileText, Image } from "lucide-react";

const ICON_MAP: Record<string, { icon: typeof File; className: string }> = {
  "application/pdf": { icon: FileText, className: "text-red-500" },
  "image/jpeg": { icon: Image, className: "text-blue-500" },
  "image/png": { icon: Image, className: "text-blue-500" },
  "image/webp": { icon: Image, className: "text-blue-500" },
};

const PATTERN_EXTENSIONS = [".pat", ".xsd", ".css", ".saga"];

export function FileTypeIcon({ mimeType, filename }: { mimeType: string; filename: string }) {
  const ext = filename.slice(filename.lastIndexOf(".")).toLowerCase();
  const mapped = ICON_MAP[mimeType];
  if (mapped) {
    const Icon = mapped.icon;
    return <Icon className={`size-4 ${mapped.className}`} aria-hidden="true" />;
  }
  if (PATTERN_EXTENSIONS.includes(ext)) {
    return <FileCode className="size-4 text-purple-500" aria-hidden="true" />;
  }
  return <File className="size-4 text-muted-foreground" aria-hidden="true" />;
}
