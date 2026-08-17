# Phase 15: Chart File Management - Pattern Map

**Mapped:** 2026-05-16
**Files analyzed:** 14 new/modified files
**Analogs found:** 14 / 14

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` | model | CRUD | Self (existing Chart model) | exact |
| `src/lib/actions/chart-file-actions.ts` | service | CRUD + file-I/O | `src/lib/actions/upload-actions.ts` | exact |
| `src/lib/actions/chart-file-actions.test.ts` | test | CRUD | `src/lib/actions/upload-actions.test.ts` | exact |
| `src/lib/validations/upload.ts` | config | transform | Self (existing file) | exact |
| `src/components/features/charts/form-primitives/chart-file-upload.tsx` | component | file-I/O | `src/components/features/charts/form-primitives/file-upload.tsx` | exact |
| `src/components/features/charts/project-detail/chart-file-list.tsx` | component | request-response | `src/components/features/charts/project-detail/overview-tab.tsx` | role-match |
| `src/components/features/charts/project-detail/chart-file-row.tsx` | component | request-response | `src/components/features/charts/project-detail/overview-tab.tsx` (KittingItem) | role-match |
| `src/components/features/charts/project-detail/file-type-icon.tsx` | component | transform | N/A (utility component, pattern in RESEARCH.md) | new-pattern |
| `src/components/features/charts/project-detail/delete-file-dialog.tsx` | component | event-driven | `src/components/features/designers/delete-confirmation-dialog.tsx` | exact |
| `src/components/features/charts/project-detail/overview-tab.tsx` | component | request-response | Self (modify existing) | exact |
| `src/components/features/charts/project-detail/types.ts` | model | N/A | Self (modify existing) | exact |
| `src/components/features/charts/chart-merged-form.tsx` | component | file-I/O | Self (modify existing, line 599-604) | exact |
| `src/components/features/charts/use-chart-form.ts` | hook | event-driven | Self (modify existing) | exact |
| `src/__tests__/mocks/factories.ts` | test | N/A | Self (modify existing, line 144) | exact |

## Pattern Assignments

### `src/lib/actions/chart-file-actions.ts` (service, CRUD + file-I/O)

**Analog:** `src/lib/actions/upload-actions.ts`

**Imports pattern** (lines 1-12):
```typescript
"use server";

import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
import { getR2Client, R2_BUCKET_NAME } from "@/lib/r2";
```

**Auth + ownership verification pattern** (upload-actions.ts lines 119-135):
```typescript
export async function confirmUpload(input: { chartId: string; field: string; key: string }) {
  const user = await requireAuth();

  try {
    // ... validation ...

    const chart = await prisma.chart.findUnique({
      where: { id: input.chartId },
      select: { id: true, project: { select: { userId: true } } },
    });
    if (!chart || chart.project?.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }
```

**R2 delete pattern** (upload-actions.ts lines 237-252):
```typescript
export async function deleteFile(key: string) {
  await requireAuth();

  try {
    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await getR2Client().send(command);
    return { success: true as const };
  } catch (error) {
    console.error("deleteFile error:", error);
    return { success: false as const, error: "Failed to delete file" };
  }
}
```

**Presigned download URL pattern** (upload-actions.ts lines 171-198):
```typescript
export async function getPresignedDownloadUrl(key: string) {
  await requireAuth();

  try {
    const command = new GetObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    const url = await getSignedUrl(getR2Client(), command, {
      expiresIn: 3600,
    });

    return { success: true as const, url };
  } catch (error) {
    console.error("getPresignedDownloadUrl R2 error:", error);
    if (
      error instanceof Error &&
      error.message.includes("R2 environment variables not configured")
    ) {
      return {
        success: false as const,
        error: "File storage is not configured. Downloads are unavailable.",
      };
    }
    return { success: false as const, error: "Failed to generate download URL" };
  }
}
```

**Return type convention** -- all actions return `{ success: true, ... }` or `{ success: false, error: string }`.

---

### `src/lib/actions/chart-file-actions.test.ts` (test, CRUD)

**Analog:** `src/lib/actions/upload-actions.test.ts`

**Test setup pattern** (lines 1-53):
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

// Mock auth to return authenticated session
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

const mockSend = vi.fn();
const mockGetR2Client = vi.fn();
vi.mock("@/lib/r2", () => ({
  getR2Client: (...args: unknown[]) => mockGetR2Client(...args),
  R2_BUCKET_NAME: "test-bucket",
}));

vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));

vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));

describe("chart-file-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSend.mockReset();
    mockGetR2Client.mockReturnValue({ send: mockSend });
    mockSend.mockResolvedValue({});
  });
```

**Action import pattern** (dynamic import for module mock isolation):
```typescript
  it("returns error for invalid image type on covers category", async () => {
    const { getPresignedUploadUrl } = await import("./upload-actions");
    const result = await getPresignedUploadUrl({ ... });
    expect(result.success).toBe(false);
  });
```

---

### `src/components/features/charts/form-primitives/chart-file-upload.tsx` (component, file-I/O)

**Analog:** `src/components/features/charts/form-primitives/file-upload.tsx`

**Full file** (lines 1-160) -- this is the exact pattern to extend for multi-file:
```typescript
"use client";

import { useCallback, useRef, useState } from "react";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { getPresignedUploadUrl } from "@/lib/actions/upload-actions";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/validations/upload";
import { Button } from "@/components/ui/button";

type UploadState = "idle" | "uploading" | "complete" | "error";

interface FileUploadProps {
  chartId?: string;
  currentFileName?: string | null;
  onUploadComplete: (key: string, fileName: string) => void;
  onRemove: () => void;
}
```

**Upload flow pattern** (file-upload.tsx lines 39-91):
```typescript
const uploadFile = useCallback(
  async (file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      setState("error");
      return;
    }

    setState("uploading");
    setError(null);

    try {
      const result = await getPresignedUploadUrl({
        fileName: file.name,
        contentType: file.type,
        fileSize: file.size,
        category: "files",
        projectId: chartId || "unsaved",
      });

      if ("success" in result && !result.success) {
        setError(result.error);
        setState("error");
        return;
      }

      if (!("url" in result)) {
        setError("Failed to get upload URL.");
        setState("error");
        return;
      }

      const uploadResponse = await fetch(result.url, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      setFileName(file.name);
      setState("complete");
      onUploadComplete(result.key, file.name);
    } catch {
      setError("Upload failed. Please try again.");
      setState("error");
    }
  },
  [chartId, onUploadComplete, validateFile],
);
```

**Hidden file input + button trigger pattern** (lines 111-119):
```typescript
<input
  ref={inputRef}
  type="file"
  accept={[...ALLOWED_FILE_TYPES, ".saga", ".oxs", ".xsd"].join(",")}
  onChange={handleFileSelect}
  className="hidden"
  aria-hidden="true"
/>
```

---

### `src/components/features/charts/project-detail/delete-file-dialog.tsx` (component, event-driven)

**Analog:** `src/components/features/designers/delete-confirmation-dialog.tsx`

**Full pattern** (lines 1-85):
```typescript
"use client";

import { useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  entityName: string;
  chartCount: number;
  entityType: "designer" | "genre" | "brand" | "supply";
  onConfirm: () => Promise<void>;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  // ...props
  onConfirm,
}: DeleteConfirmationDialogProps) {
  const [isPending, startTransition] = useTransition();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await onConfirm();
        onOpenChange(false);
      } catch {
        // onConfirm caller handles error reporting (toast);
        // dialog stays open so user can retry
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg font-semibold">{title}</DialogTitle>
          <DialogDescription>{/* ... */}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

---

### `src/components/features/charts/project-detail/chart-file-list.tsx` (component, request-response)

**Analog:** `src/components/features/charts/project-detail/overview-tab.tsx`

**Client component structure with InfoCard pattern** (overview-tab.tsx lines 1-19):
```typescript
import Link from "next/link";
import {
  Scissors,
  BookOpen,
  Calendar,
  Settings,
  CheckCircle,
  ClipboardList,
  Check,
  X,
} from "lucide-react";
import { InfoCard } from "@/components/features/charts/info-card";
import { DetailRow } from "@/components/features/charts/detail-row";
```

**Props pattern for section components** (overview-tab.tsx lines 32-36):
```typescript
interface OverviewTabProps {
  chart: ProjectDetailProps["chart"];
  supplies: ProjectDetailProps["supplies"];
  sessionCount: number;
}
```

---

### `src/components/features/charts/project-detail/overview-tab.tsx` (modify existing)

**Kitting item pattern to modify** (lines 110-114):
```typescript
<KittingItem
  label="Digital Copy"
  ready={!!chart.digitalWorkingCopyUrl}
  detail={chart.digitalWorkingCopyUrl ? "Ready" : "Not uploaded"}
/>
```

Change to reference file count from a `_count` or `files` array on the chart prop. The `KittingItem` helper component pattern (lines 228-239) stays the same.

---

### `src/components/features/charts/project-detail/types.ts` (modify existing)

**Current field to replace** (line 64):
```typescript
digitalWorkingCopyUrl: string | null;
```

Replace with:
```typescript
files: { id: string; url: string; filename: string; mimeType: string; fileSize: number; label: string | null; notes: string | null; createdAt: Date }[];
// or use _count: { files: number } for just the count
```

---

### `src/components/features/charts/chart-merged-form.tsx` (modify existing)

**Current FileUpload integration** (lines 599-604):
```typescript
<FormField label="Digital Working Copy" htmlFor="digital-file">
  <FileUpload
    onUploadComplete={(key) => form.setField("digitalFileUrl", key)}
    onRemove={() => form.setField("digitalFileUrl", null)}
  />
</FormField>
```

Replace `FileUpload` import (line 25) with `ChartFileUpload` and update form integration to track multiple files.

---

### `src/components/features/charts/use-chart-form.ts` (modify existing)

**Current digitalFileUrl handling** (lines 24, 117, 213):
```typescript
// In ChartFormValues interface (line 24):
digitalFileUrl: string | null;

// In buildInitialValues (line 117):
digitalFileUrl: data.digitalWorkingCopyUrl,

// In submitForm formData (line 213):
digitalFileUrl: values.digitalFileUrl,
```

Replace single `digitalFileUrl: string | null` with multi-file tracking (array of upload results). The `formData` construction in `submitForm` (line 206-237) shows how form values map to the server action payload.

---

### `src/lib/validations/upload.ts` (modify existing)

**Current ALLOWED_FILE_TYPES** (lines 5-11):
```typescript
export const ALLOWED_FILE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "application/octet-stream", // .saga, .oxs, .xsd (cross-stitch software formats)
] as const;
```

Add `"text/css"` to the allowlist (browser reports .css CrossStitch files as `text/css`). Add `ALLOWED_CHART_FILE_EXTENSIONS` constant for the `accept` attribute.

---

### `prisma/schema.prisma` (modify existing)

**Current Chart model** (lines 41-63):
```prisma
model Chart {
  id                     String    @id @default(cuid())
  name                   String
  // ... fields ...
  digitalWorkingCopyUrl  String?
  dateAdded              DateTime  @default(now())
  project                Project?
  notes                  String?
  createdAt              DateTime  @default(now())
  updatedAt              DateTime  @updatedAt
}
```

Add `files ChartFile[]` relation, remove `digitalWorkingCopyUrl`. New `ChartFile` model follows the same pattern as other models in the schema (cuid id, relation with index, timestamps).

---

### `src/__tests__/mocks/factories.ts` (modify existing)

**Current chart factory** (lines 130-151):
```typescript
  return {
    id: "chart-1",
    name: "Test Chart",
    // ...
    digitalWorkingCopyUrl: null,
    // ...
    ...overrides,
  };
```

Remove `digitalWorkingCopyUrl`, align with the new schema.

---

## Shared Patterns

### Authentication & Ownership
**Source:** `src/lib/actions/upload-actions.ts` lines 119-135
**Apply to:** `chart-file-actions.ts` (all actions)
```typescript
const user = await requireAuth();

const chart = await prisma.chart.findUnique({
  where: { id: validated.chartId },
  select: { id: true, project: { select: { userId: true } } },
});
if (!chart || chart.project?.userId !== user.id) {
  return { success: false as const, error: "Chart not found" };
}
```

### Error Handling (Server Actions)
**Source:** `src/lib/actions/upload-actions.ts` lines 48-116
**Apply to:** All new server actions
```typescript
// Pattern: Zod parse in try/catch, return typed success/error
let validated;
try {
  validated = schema.parse(input);
} catch (error) {
  if (error instanceof z.ZodError) {
    return { success: false as const, error: error.errors[0].message };
  }
  return { success: false as const, error: "Invalid request" };
}
```

### Validation Constants
**Source:** `src/lib/validations/upload.ts` lines 1-33
**Apply to:** `chart-file-upload.tsx` (client validation), `chart-file-actions.ts` (server validation)
```typescript
export const ALLOWED_FILE_TYPES = [ /* ... */ ] as const;
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export const uploadRequestSchema = z.object({
  fileName: z.string().trim().min(1),
  contentType: z.string().trim().min(1),
  fileSize: z.number().int().positive().max(MAX_FILE_SIZE, "File is too large. Maximum size is 10MB."),
  category: z.enum(["covers", "files", "sessions"]),
  projectId: z.string().trim().min(1),
});
```

### Dialog Component Pattern
**Source:** `src/components/features/designers/delete-confirmation-dialog.tsx` lines 1-85
**Apply to:** `delete-file-dialog.tsx`
- Uses `useTransition` for pending state
- `Dialog` + `DialogContent` + `DialogHeader` + `DialogFooter` from `@/components/ui/dialog`
- Destructive variant button with pending text
- Error handling: catch block keeps dialog open for retry

### Component Test Pattern
**Source:** `src/components/features/charts/project-detail/overview-tab.test.tsx` lines 1-56
**Apply to:** All new component tests
```typescript
import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";

// Factory helper for typed test props
function makeChart(overrides: { ... } = {}): ChartProp {
  return { /* sensible defaults */ ...overrides };
}
```

### Action Test Pattern
**Source:** `src/lib/actions/upload-actions.test.ts` lines 1-53
**Apply to:** `chart-file-actions.test.ts`
- `vi.mock` for auth, db, next/cache, R2, nanoid
- `createMockPrisma()` from `@/__tests__/mocks`
- `beforeEach` with `vi.clearAllMocks()` + mock reset
- Dynamic `await import()` for action under test

## No Analog Found

| File | Role | Data Flow | Reason |
|------|------|-----------|--------|
| `src/components/features/charts/project-detail/file-type-icon.tsx` | component | transform | Pure mapping utility -- no similar icon-dispatch component exists. Use the pattern from RESEARCH.md (Lucide icons mapped by MIME type + extension fallback). |

## Metadata

**Analog search scope:** `src/lib/actions/`, `src/components/features/charts/`, `src/components/features/designers/`, `src/__tests__/mocks/`, `prisma/`, `src/lib/validations/`, `src/types/`
**Files scanned:** ~25 (targeted search by role)
**Pattern extraction date:** 2026-05-16
