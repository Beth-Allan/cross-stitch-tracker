# Phase 8: Session Logging & Pattern Dive - Pattern Map

**Mapped:** 2026-04-16
**Files analyzed:** 22 new/modified files
**Analogs found:** 22 / 22

## File Classification

| New/Modified File | Role | Data Flow | Closest Analog | Match Quality |
|-------------------|------|-----------|----------------|---------------|
| `prisma/schema.prisma` (modify) | model | CRUD | itself (existing models) | exact |
| `prisma/migrations/*/migration.sql` | migration | batch | N/A (one-time SQL) | no-analog |
| `src/lib/validations/session.ts` | utility | transform | `src/lib/validations/chart.ts` | exact |
| `src/lib/validations/session.test.ts` | test | transform | `src/lib/validations/storage.test.ts` | exact |
| `src/lib/validations/upload.ts` (modify) | utility | transform | itself | exact |
| `src/lib/actions/session-actions.ts` | service | CRUD | `src/lib/actions/supply-actions.ts` | exact |
| `src/lib/actions/session-actions.test.ts` | test | CRUD | `src/lib/actions/supply-actions.test.ts` | exact |
| `src/lib/actions/pattern-dive-actions.ts` | service | request-response | `src/lib/actions/chart-actions.ts` (getChartsForGallery) | role-match |
| `src/lib/actions/pattern-dive-actions.test.ts` | test | request-response | `src/lib/actions/chart-actions.test.ts` | role-match |
| `src/types/session.ts` | model | N/A | `src/types/chart.ts` | exact |
| `src/components/features/sessions/log-session-modal.tsx` | component | request-response | `src/components/ui/dialog.tsx` + DesignOS LogSessionModal | exact |
| `src/components/features/sessions/log-session-modal.test.tsx` | test | request-response | existing component tests | role-match |
| `src/components/features/sessions/project-sessions-tab.tsx` | component | request-response | `src/components/features/charts/project-detail/overview-tab.tsx` | role-match |
| `src/components/features/sessions/project-sessions-tab.test.tsx` | test | request-response | existing component tests | role-match |
| `src/components/features/sessions/session-table.tsx` | component | request-response | gallery table/list patterns | role-match |
| `src/components/features/sessions/session-table.test.tsx` | test | request-response | existing component tests | role-match |
| `src/components/features/charts/pattern-dive-tabs.tsx` | component | request-response | `src/components/features/charts/project-detail/project-tabs.tsx` | exact |
| `src/components/features/charts/pattern-dive-tabs.test.tsx` | test | request-response | existing component tests | role-match |
| `src/components/features/charts/whats-next-tab.tsx` | component | request-response | N/A (new data view) | partial |
| `src/components/features/charts/fabric-requirements-tab.tsx` | component | request-response | N/A (new data view) | partial |
| `src/components/features/charts/storage-view-tab.tsx` | component | request-response | N/A (new data view) | partial |
| `src/app/(dashboard)/charts/page.tsx` (modify) | controller | request-response | itself + `src/app/(dashboard)/charts/[id]/page.tsx` | exact |
| `src/app/(dashboard)/sessions/page.tsx` (modify) | controller | request-response | `src/app/(dashboard)/charts/page.tsx` | exact |
| `src/components/shell/top-bar.tsx` (modify) | component | event-driven | itself | exact |
| `src/components/shell/app-shell.tsx` (modify) | component | request-response | itself | exact |
| `src/components/shell/nav-items.ts` (modify) | config | N/A | itself | exact |
| `src/components/features/charts/project-detail/project-detail-page.tsx` (modify) | component | request-response | itself | exact |
| `src/components/features/charts/project-detail/project-tabs.tsx` (modify) | component | request-response | itself | exact |
| `src/components/features/charts/project-detail/types.ts` (modify) | model | N/A | itself | exact |
| `src/__tests__/mocks/factories.ts` (modify) | test | N/A | itself | exact |

## Pattern Assignments

### `prisma/schema.prisma` (model, CRUD) -- ADD StitchSession

**Analog:** Same file, existing models (lines 65-94 for Project, lines 179-193 for ProjectThread)

**Model pattern** -- new model follows Project child conventions:
```prisma
// Source: prisma/schema.prisma lines 179-193 (ProjectThread as child-of-Project pattern)
model ProjectThread {
  id               String   @id @default(cuid())
  project          Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  projectId        String
  // ... fields ...
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@unique([projectId, threadId])
}
```

**Relation addition** -- add to Project model (line 94 area):
```prisma
// Source: prisma/schema.prisma line 89-91 (existing relation fields on Project)
  projectThreads       ProjectThread[]
  projectBeads         ProjectBead[]
  projectSpecialty     ProjectSpecialty[]
  // ADD: sessions StitchSession[]
```

---

### `src/lib/validations/session.ts` (utility, transform)

**Analog:** `src/lib/validations/chart.ts`

**Imports pattern** (lines 1-3):
```typescript
import { z } from "zod";
import type { ProjectStatus } from "@/generated/prisma/client";
import { PROJECT_STATUSES } from "@/lib/utils/status";
```

**Zod schema pattern** (lines 5-55):
```typescript
// Source: src/lib/validations/chart.ts lines 5-55
export const chartFormSchema = z.object({
  chart: z.object({
    name: z.string().trim().min(1, "Chart name is required").max(200, "Chart name too long"),
    // ...
  }),
  project: z.object({
    // Date validation pattern (lines 36-41):
    startDate: z
      .string()
      .nullable()
      .default(null)
      .refine((val) => val === null || !isNaN(Date.parse(val)), { message: "Invalid date" }),
    startingStitches: z.number().int().min(0).default(0),
  }),
});

export type ChartFormInput = z.infer<typeof chartFormSchema>;
```

---

### `src/lib/validations/session.test.ts` (test, transform)

**Analog:** `src/lib/validations/storage.test.ts`

**Full test structure** (lines 1-65):
```typescript
// Source: src/lib/validations/storage.test.ts lines 1-36
import { describe, expect, it } from "vitest";
import { storageLocationSchema, stitchingAppSchema } from "./storage";

describe("storageLocationSchema", () => {
  it("parses valid input and trims whitespace", () => {
    const result = storageLocationSchema.parse({ name: " Bin A " });
    expect(result).toEqual({ name: "Bin A", description: null });
  });

  it("rejects empty string name after trim", () => {
    expect(() => storageLocationSchema.parse({ name: "   " })).toThrow("Name is required");
  });

  it("rejects name over 200 chars", () => {
    const longName = "A".repeat(201);
    expect(() => storageLocationSchema.parse({ name: longName })).toThrow("Name too long");
  });

  it("defaults description to null when not provided", () => {
    const result = storageLocationSchema.parse({ name: "Test" });
    expect(result.description).toBeNull();
  });
});
```

---

### `src/lib/validations/upload.ts` (modify -- add "sessions" category)

**Analog:** Itself

**Current category enum** (line 24):
```typescript
// Source: src/lib/validations/upload.ts line 24
  category: z.enum(["covers", "files"]),
// Change to:
  category: z.enum(["covers", "files", "sessions"]),
```

---

### `src/lib/actions/session-actions.ts` (service, CRUD)

**Analog:** `src/lib/actions/supply-actions.ts` (CRUD pattern) + `src/lib/actions/chart-actions.ts` ($transaction pattern)

**Imports pattern** (supply-actions.ts lines 1-10):
```typescript
// Source: src/lib/actions/supply-actions.ts lines 1-10
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth-guard";
import { prisma } from "@/lib/db";
```

**Create with ownership validation + $transaction** (chart-actions.ts lines 12-106):
```typescript
// Source: src/lib/actions/chart-actions.ts lines 12-14, 27-83, 96-105
export async function createChart(formData: unknown) {
  const user = await requireAuth();

  try {
    const validated = chartFormSchema.parse(formData);
    // ...

    const created = await prisma.$transaction(async (tx) => {
      const result = await tx.chart.create({ data: { ... } });
      // ... additional operations inside transaction ...
      return result;
    });

    revalidatePath("/charts");
    return { success: true as const, chartId: created.id };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createChart error:", error);
    return { success: false as const, error: "Failed to create chart" };
  }
}
```

**Ownership validation before mutation** (chart-actions.ts lines 108-119):
```typescript
// Source: src/lib/actions/chart-actions.ts lines 108-119
export async function updateChart(chartId: string, formData: unknown) {
  const user = await requireAuth();

  try {
    const existing = await prisma.chart.findUnique({
      where: { id: chartId },
      select: { coverImageUrl: true, project: { select: { id: true, userId: true } } },
    });
    if (!existing?.project || existing.project.userId !== user.id) {
      return { success: false as const, error: "Chart not found" };
    }
    // ...
```

**Simple CRUD pattern** (supply-actions.ts lines 57-78):
```typescript
// Source: src/lib/actions/supply-actions.ts lines 57-78
export async function createThread(formData: unknown) {
  await requireAuth();

  try {
    const validated = threadSchema.parse(formData);
    const thread = await prisma.thread.create({ data: validated });
    revalidatePath("/supplies");
    return { success: true as const, thread };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("createThread error:", error);
    return { success: false as const, error: "Failed to create thread" };
  }
}
```

**Delete pattern** (supply-actions.ts lines 106-117):
```typescript
// Source: src/lib/actions/supply-actions.ts lines 106-117
export async function deleteThread(id: string) {
  await requireAuth();

  try {
    await prisma.thread.delete({ where: { id } });
    revalidatePath("/supplies");
    return { success: true as const };
  } catch (error) {
    console.error("deleteThread error:", error);
    return { success: false as const, error: "Failed to delete thread" };
  }
}
```

**Read/query pattern** (chart-actions.ts lines 326-357):
```typescript
// Source: src/lib/actions/chart-actions.ts lines 326-357
export async function getChartsForGallery() {
  const user = await requireAuth();

  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: {
      project: {
        select: {
          id: true,
          status: true,
          // ...
        },
      },
      designer: true,
      genres: true,
    },
    orderBy: { dateAdded: "desc" },
  });
}
```

---

### `src/lib/actions/session-actions.test.ts` (test, CRUD)

**Analog:** `src/lib/actions/supply-actions.test.ts`

**Test setup with mocks** (lines 1-34):
```typescript
// Source: src/lib/actions/supply-actions.test.ts lines 1-34
import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  createMockPrisma,
  createMockThread,
  // ... other factories
} from "@/__tests__/mocks";

// Mock auth - default to authenticated
const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({
  auth: mockAuth,
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("supply-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });
```

**Auth guard test pattern** (lines 38-51):
```typescript
// Source: src/lib/actions/supply-actions.test.ts lines 38-51
  describe("auth guard", () => {
    it("rejects unauthenticated calls to createThread", async () => {
      mockAuth.mockResolvedValueOnce(null);
      const { createThread } = await import("./supply-actions");
      await expect(
        createThread({
          brandId: "b1",
          colorCode: "310",
          colorName: "Black",
          hexColor: "#000000",
          colorFamily: "BLACK",
        }),
      ).rejects.toThrow("Unauthorized");
    });
  });
```

**$transaction mock pattern** -- from chart-actions.test.ts (lines 1-13):
```typescript
// Source: src/lib/actions/chart-actions.test.ts lines 1-13
import { describe, expect, it, vi } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue(null),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));
```

---

### `src/lib/actions/pattern-dive-actions.ts` (service, request-response)

**Analog:** `src/lib/actions/chart-actions.ts` (getChartsForGallery, getChart)

**Query action pattern** (chart-actions.ts lines 326-357):
```typescript
// Source: src/lib/actions/chart-actions.ts lines 326-357
export async function getChartsForGallery() {
  const user = await requireAuth();

  return await prisma.chart.findMany({
    where: { project: { userId: user.id } },
    include: { /* ... */ },
    orderBy: { dateAdded: "desc" },
  });
}
```

---

### `src/types/session.ts` (model)

**Analog:** `src/types/chart.ts`

**Type definition pattern** (lines 1-49):
```typescript
// Source: src/types/chart.ts lines 1-49
import type {
  Chart,
  Project,
  ProjectStatus,
  Designer,
  Fabric,
  FabricBrand,
  Genre,
  StorageLocation,
  StitchingApp,
} from "@/generated/prisma/client";

export type ProjectWithRelations = Project & {
  storageLocation: Pick<StorageLocation, "id" | "name"> | null;
  stitchingApp: Pick<StitchingApp, "id" | "name"> | null;
  fabric: (Fabric & { brand: FabricBrand }) | null;
};

export type ChartWithProject = Chart & {
  project: ProjectWithRelations | null;
  designer: Designer | null;
  genres: Genre[];
};
```

---

### `src/components/features/sessions/log-session-modal.tsx` (component, request-response)

**Analog:** `src/components/ui/dialog.tsx` (Dialog API) + DesignOS `LogSessionModal.tsx`

**Dialog usage pattern** (from dialog.tsx exports):
```typescript
// Source: src/components/ui/dialog.tsx lines 127-138
export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
```

**DialogContent with larger max-width** (dialog.tsx line 53 -- override sm:max-w-sm):
```typescript
// Source: src/components/ui/dialog.tsx line 53
// Default: "sm:max-w-sm" -- override for modal forms:
<DialogContent className="sm:max-w-md">
```

**DesignOS modal structure** (LogSessionModal.tsx lines 12-20):
```typescript
// Source: product-plan/.../LogSessionModal.tsx lines 12-20
interface LogSessionModalProps {
  isOpen: boolean
  editSession?: StitchSession | null
  activeProjects: ActiveProject[]
  onSave?: (session: Partial<StitchSession>) => void
  onDelete?: (sessionId: string) => void
  onUploadPhoto?: (sessionId: string, file: File) => void
  onClose?: () => void
}
```

---

### `src/components/features/charts/pattern-dive-tabs.tsx` (component, request-response)

**Analog:** `src/components/features/charts/project-detail/project-tabs.tsx` -- EXACT match

**Full file as template** (lines 1-36):
```typescript
// Source: src/components/features/charts/project-detail/project-tabs.tsx lines 1-36
"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TAB_VALUES, type TabValue } from "./types";

interface ProjectTabsProps {
  overviewContent: React.ReactNode;
  suppliesContent: React.ReactNode;
}

export function ProjectTabs({ overviewContent, suppliesContent }: ProjectTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...TAB_VALUES]).withDefault("overview"),
  );

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as TabValue)}>
      <TabsList variant="line">
        <TabsTrigger value="overview" className="min-h-11">
          Overview
        </TabsTrigger>
        <TabsTrigger value="supplies" className="min-h-11">
          Supplies
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-6">
        {overviewContent}
      </TabsContent>
      <TabsContent value="supplies" className="pt-6">
        {suppliesContent}
      </TabsContent>
    </Tabs>
  );
}
```

**Tab types pattern** (project-detail/types.ts lines 1-2):
```typescript
// Source: src/components/features/charts/project-detail/types.ts lines 10-11
export const TAB_VALUES = ["overview", "supplies"] as const;
export type TabValue = (typeof TAB_VALUES)[number];
```

---

### `src/app/(dashboard)/charts/page.tsx` (modify -- evolve into Pattern Dive)

**Analog:** Itself + `src/app/(dashboard)/charts/[id]/page.tsx`

**Current server component page** (lines 1-13):
```typescript
// Source: src/app/(dashboard)/charts/page.tsx lines 1-13
import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";

export default async function ChartsPage() {
  const charts = await getChartsForGallery();
  const imageKeys = charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]);
  const imageUrls = await getPresignedImageUrls(imageKeys);
  return <ProjectGallery charts={charts} imageUrls={imageUrls} />;
}
```

**Promise.all() pattern from chart detail** (charts/[id]/page.tsx lines 13-16):
```typescript
// Source: src/app/(dashboard)/charts/[id]/page.tsx lines 13-16
  const [projectSupplies, imageUrls] = await Promise.all([
    chart.project ? getProjectSupplies(chart.project.id) : null,
    getPresignedImageUrls([chart.coverImageUrl, chart.coverThumbnailUrl]),
  ]);
```

---

### `src/app/(dashboard)/sessions/page.tsx` (modify -- replace placeholder)

**Analog:** `src/app/(dashboard)/charts/page.tsx` (server component page with data fetching)

**Server component page pattern** (charts/page.tsx lines 1-13):
```typescript
// Source: src/app/(dashboard)/charts/page.tsx lines 1-13
import { getChartsForGallery } from "@/lib/actions/chart-actions";
import { getPresignedImageUrls } from "@/lib/actions/upload-actions";
import { ProjectGallery } from "@/components/features/gallery/project-gallery";

export default async function ChartsPage() {
  const charts = await getChartsForGallery();
  const imageKeys = charts.flatMap((c) => [c.coverImageUrl, c.coverThumbnailUrl]);
  const imageUrls = await getPresignedImageUrls(imageKeys);
  return <ProjectGallery charts={charts} imageUrls={imageUrls} />;
}
```

---

### `src/components/shell/top-bar.tsx` (modify -- replace toast with modal trigger)

**Analog:** Itself

**Current toast placeholder to replace** (lines 85-97):
```typescript
// Source: src/components/shell/top-bar.tsx lines 85-97
        <Button
          variant="secondary"
          size="sm"
          onClick={() =>
            toast("Coming soon", {
              description: "You'll be able to log your stitching sessions here.",
            })
          }
          className="flex min-h-11 items-center gap-1.5 sm:min-h-0"
        >
          <Clock className="h-3.5 w-3.5" strokeWidth={2} />
          <span className="hidden sm:inline">Log Stitches</span>
        </Button>
```

**Existing useState pattern** (line 20):
```typescript
// Source: src/components/shell/top-bar.tsx line 20
  const [sheetOpen, setSheetOpen] = useState(false);
```

**TopBar props** (lines 15-17):
```typescript
// Source: src/components/shell/top-bar.tsx lines 15-17
interface TopBarProps {
  user: { name: string; email: string };
}
```

---

### `src/components/shell/app-shell.tsx` (modify -- pass active projects to TopBar)

**Analog:** Itself

**Current structure** (lines 1-30):
```typescript
// Source: src/components/shell/app-shell.tsx lines 1-30
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";

interface AppShellProps {
  children: React.ReactNode;
  user: { name: string; email: string };
}

export function AppShell({ children, user }: AppShellProps) {
  return (
    <div className="bg-background flex h-screen overflow-hidden">
      {/* ... skip to content ... */}
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopBar user={user} />
        <main id="main-content" className="flex-1 overflow-y-auto p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
```

---

### `src/components/shell/nav-items.ts` (modify -- rename "Projects" label)

**Analog:** Itself

**Current label to change** (line 33):
```typescript
// Source: src/components/shell/nav-items.ts line 33
      { label: "Projects", href: "/charts", icon: Scissors },
// Change to:
      { label: "Pattern Dive", href: "/charts", icon: Scissors },
```

---

### `src/components/features/charts/project-detail/project-detail-page.tsx` (modify -- add Sessions tab)

**Analog:** Itself

**Current tab rendering** (lines 46-58):
```typescript
// Source: src/components/features/charts/project-detail/project-detail-page.tsx lines 46-58
      <ProjectTabs
        overviewContent={<OverviewTab chart={chartWithCurrentStatus} supplies={supplies} />}
        suppliesContent={
          project && supplies ? (
            <SuppliesTab chartId={chart.id} project={project} supplies={supplies} />
          ) : (
            <div className="text-muted-foreground py-12 text-center">
              <p className="font-heading text-lg font-semibold">No project linked</p>
              <p className="mt-1 text-sm">Create a project to manage supplies.</p>
            </div>
          )
        }
      />
```

---

### `src/components/features/charts/project-detail/project-tabs.tsx` (modify -- add Sessions tab)

**Analog:** Itself (extend with third tab)

**Current tab config** (lines 1-36):
```typescript
// Source: full file -- add sessionsContent prop and third tab
```

---

### `src/components/features/charts/project-detail/types.ts` (modify -- add "sessions" to TAB_VALUES)

**Analog:** Itself

**Current** (line 10):
```typescript
// Source: src/components/features/charts/project-detail/types.ts line 10
export const TAB_VALUES = ["overview", "supplies"] as const;
// Change to:
export const TAB_VALUES = ["overview", "supplies", "sessions"] as const;
```

---

### `src/__tests__/mocks/factories.ts` (modify -- add StitchSession factory + mock model)

**Analog:** Itself

**Factory pattern** (lines 195-207 for createMockThread):
```typescript
// Source: src/__tests__/mocks/factories.ts lines 195-207
export function createMockThread(overrides?: Partial<Thread>): Thread {
  return {
    id: "thread-1",
    brandId: "brand-1",
    colorCode: "310",
    colorName: "Black",
    hexColor: "#000000",
    colorFamily: "BLACK",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}
```

**createMockPrisma model addition** (lines 403-518):
```typescript
// Source: src/__tests__/mocks/factories.ts lines 403-517
// Add to createMockPrisma():
    stitchSession: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      aggregate: vi.fn(),
    },
```

---

## Shared Patterns

### Authentication (requireAuth)
**Source:** `src/lib/auth-guard.ts` (lines 1-22)
**Apply to:** All server action files (`session-actions.ts`, `pattern-dive-actions.ts`)
```typescript
import { requireAuth } from "@/lib/auth-guard";

// In every exported action:
export async function someAction(formData: unknown) {
  const user = await requireAuth();
  // ...
}
```

### Error Handling
**Source:** `src/lib/actions/supply-actions.ts` (lines 60-78)
**Apply to:** All server action files
```typescript
  try {
    const validated = someSchema.parse(formData);
    // ... operation ...
    revalidatePath("/path");
    return { success: true as const, /* data */ };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false as const, error: error.errors[0].message };
    }
    console.error("actionName error:", error);
    return { success: false as const, error: "Failed to do thing" };
  }
```

### $transaction for Atomic Operations
**Source:** `src/lib/actions/chart-actions.ts` (lines 27-83)
**Apply to:** `session-actions.ts` (createSession, updateSession, deleteSession)
```typescript
const result = await prisma.$transaction(async (tx) => {
  // 1. Mutation (create/update/delete)
  const session = await tx.stitchSession.create({ data: { ... } });
  // 2. Recalculate derived field
  const agg = await tx.stitchSession.aggregate({ where: { projectId }, _sum: { stitchCount: true } });
  await tx.project.update({ where: { id: projectId }, data: { stitchesCompleted: startingStitches + (agg._sum.stitchCount ?? 0) } });
  return session;
});
```

### Ownership Validation
**Source:** `src/lib/actions/chart-actions.ts` (lines 112-118)
**Apply to:** `session-actions.ts` (all mutations must verify project.userId === user.id)
```typescript
const project = await prisma.project.findUnique({
  where: { id: validated.projectId },
  select: { userId: true, chartId: true },
});
if (!project || project.userId !== user.id) {
  return { success: false as const, error: "Project not found" };
}
```

### nuqs URL Tab State
**Source:** `src/components/features/charts/project-detail/project-tabs.tsx` (lines 1-36)
**Apply to:** `pattern-dive-tabs.tsx`
```typescript
"use client";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const TABS = ["browse", "whats-next", "fabric", "storage"] as const;
const [tab, setTab] = useQueryState("tab", parseAsStringLiteral([...TABS]).withDefault("browse"));
```

### Server Component Page with Eager Data Fetching
**Source:** `src/app/(dashboard)/charts/[id]/page.tsx` (lines 1-19)
**Apply to:** Charts page.tsx (Pattern Dive), Sessions page.tsx
```typescript
export default async function Page() {
  const [dataA, dataB, imageUrls] = await Promise.all([
    getDataA(),
    getDataB(),
    getPresignedImageUrls([/* keys */]),
  ]);
  return <ClientComponent dataA={dataA} dataB={dataB} imageUrls={imageUrls} />;
}
```

### Test Mock Setup
**Source:** `src/lib/actions/supply-actions.test.ts` (lines 1-34)
**Apply to:** All new test files
```typescript
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

const mockAuth = vi.fn();
vi.mock("@/lib/auth", () => ({ auth: mockAuth }));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

describe("session-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.mockResolvedValue({
      user: { id: "user-1", name: "Test", email: "test@test.com" },
    });
  });
  // ...
});
```

### R2 Upload (Presigned URL)
**Source:** `src/lib/actions/upload-actions.ts` (lines 26-89)
**Apply to:** Session photo upload in `log-session-modal.tsx`
```typescript
// Client-side usage (already established):
// 1. Call getPresignedUploadUrl({ fileName, contentType, fileSize, category: "sessions", projectId })
// 2. PUT file to returned URL
// 3. Use returned key in session form data
```

### Validation Schema Pattern (Zod)
**Source:** `src/lib/validations/chart.ts` (lines 29-51)
**Apply to:** `src/lib/validations/session.ts`
```typescript
// Date validation:
date: z.string().refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date" }),
// Numeric fields:
stitchCount: z.number().int().min(1, "Stitch count must be at least 1"),
timeSpentMinutes: z.number().int().min(0).nullable().default(null),
```

## No Analog Found

| File | Role | Data Flow | Reason | Guidance |
|------|------|-----------|--------|----------|
| `prisma/migrations/*/migration.sql` | migration | batch | One-time data migration for D-05 | Write raw SQL: `UPDATE "Project" SET "startingStitches" = "stitchesCompleted" WHERE "stitchesCompleted" > 0 AND "startingStitches" = 0` |
| `src/components/features/charts/whats-next-tab.tsx` | component | request-response | New tab type -- data table with ranking | Use DesignOS `PatternDive.tsx` WhatsNextTab section as design spec. Follow existing table/card patterns from gallery. |
| `src/components/features/charts/fabric-requirements-tab.tsx` | component | request-response | New tab type -- calculation + matching | Use DesignOS `PatternDive.tsx` FabricRequirementsTab section. 3" margin formula from design. |
| `src/components/features/charts/storage-view-tab.tsx` | component | request-response | New tab type -- grouped collapsible view | Use DesignOS `PatternDive.tsx` StorageViewTab section. Follow collapsible group UI patterns. |

## Metadata

**Analog search scope:** `src/`, `prisma/`, `product-plan/sections/`
**Files scanned:** ~80 source files across actions, components, validations, types, tests, and DesignOS
**Pattern extraction date:** 2026-04-16
