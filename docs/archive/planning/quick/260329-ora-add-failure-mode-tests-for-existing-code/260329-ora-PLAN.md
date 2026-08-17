---
phase: quick
plan: 260329-ora
type: execute
wave: 1
depends_on: []
files_modified:
  - src/lib/actions/chart-actions.test.ts
  - src/lib/actions/upload-actions.test.ts
  - src/components/features/charts/chart-add-form.test.tsx
autonomous: true
must_haves:
  truths:
    - "Chart actions return structured errors on Zod validation failure"
    - "Chart actions return structured errors on Prisma/DB failure"
    - "Upload actions return error when R2 is not configured"
    - "Upload actions return error for invalid file types"
    - "Form displays server-side error message on action failure"
    - "Form displays generic error on unexpected throw"
  artifacts:
    - path: "src/lib/actions/chart-actions.test.ts"
      provides: "Auth happy-path + error-path tests for all chart actions"
    - path: "src/lib/actions/upload-actions.test.ts"
      provides: "Upload action failure mode tests"
    - path: "src/components/features/charts/chart-add-form.test.tsx"
      provides: "Form error state rendering tests"
  key_links:
    - from: "chart-actions.test.ts"
      to: "chart-actions.ts"
      via: "mock auth + mock prisma"
      pattern: "requireAuth|prisma\\.chart"
    - from: "upload-actions.test.ts"
      to: "upload-actions.ts"
      via: "mock auth + mock R2"
      pattern: "requireAuth|getR2Client"
    - from: "chart-add-form.test.tsx"
      to: "use-chart-form.ts"
      via: "mock createChart returning errors"
      pattern: "mockCreateChart.*success.*false"
---

<objective>
Add failure-mode tests for existing server actions and form components. Current tests only cover auth guards (unauthenticated throws) and happy-path form submission. This plan adds: authenticated action error paths (Zod validation, DB errors), upload action failures (R2 not configured, invalid types), and form error state rendering (server errors, unexpected throws).

Purpose: Catch regressions in error handling before merging PR #2.
Output: Extended test files with comprehensive failure coverage.
</objective>

<execution_context>
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/workflows/execute-plan.md
@/Users/wanderskye/Projects/cross-stitch-tracker/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@src/__tests__/mocks/factories.ts
@src/__tests__/mocks/module-mocks.ts
@src/lib/actions/chart-actions.ts
@src/lib/actions/upload-actions.ts
@src/lib/auth-guard.ts
@src/lib/validations/upload.ts
@src/components/features/charts/use-chart-form.ts

<interfaces>
From src/lib/auth-guard.ts:
```typescript
export async function requireAuth(): Promise<{ id: string; name?: string | null; email?: string | null }>;
// Throws Error("Unauthorized") when no session
```

From src/lib/actions/chart-actions.ts:
```typescript
export async function createChart(formData: unknown): Promise<{ success: true; chartId: string } | { success: false; error: string }>;
export async function updateChart(chartId: string, formData: unknown): Promise<{ success: true } | { success: false; error: string }>;
export async function deleteChart(chartId: string): Promise<{ success: true } | { success: false; error: string }>;
export async function updateChartStatus(chartId: string, status: string): Promise<{ success: true } | { success: false; error: string }>;
export async function getChart(chartId: string): Promise<ChartWithRelations | null>;
export async function getCharts(): Promise<ChartWithRelations[]>;
```

From src/lib/actions/upload-actions.ts:
```typescript
export async function getPresignedUploadUrl(input: unknown): Promise<{ success: true; url: string; key: string } | { success: false; error: string }>;
export async function confirmUpload(input: { chartId: string; field: string; key: string }): Promise<{ success: true } | { success: false; error: string }>;
export async function deleteFile(key: string): Promise<{ success: true } | { success: false; error: string }>;
```

From src/__tests__/mocks/factories.ts:
```typescript
export function createMockPrisma(): { chart: { create, findMany, findUnique, update, delete }, project: { update }, designer: { create, findMany }, genre: { create, findMany } };
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Chart action authenticated error paths</name>
  <files>src/lib/actions/chart-actions.test.ts</files>
  <action>
Extend the existing chart-actions.test.ts. Keep the existing "auth guard" describe block unchanged. Add a NEW describe block "chart-actions authenticated error paths" that mocks auth to return a valid session (auth returns { user: { id: "user-1", name: "Test", email: "test@test.com" } }).

Use createMockPrisma from @/__tests__/mocks for DB mocks. Use a separate test file setup pattern: since vi.mock is hoisted, create a second test file OR use vi.hoisted + conditional mock. Simplest approach: create the authenticated tests in a SEPARATE describe that re-imports with a different auth mock using vi.mock with a factory that returns authenticated session.

Actually, since Vitest hoists vi.mock globally per file and the existing file mocks auth as null, the cleanest approach is: add a NEW file `src/lib/actions/chart-actions-errors.test.ts` for authenticated error paths. This avoids fighting the existing null auth mock.

In the new file, mock auth to return authenticated session:
```typescript
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));
```

Tests to write:

1. **createChart — Zod validation failure**: Call createChart({}) (empty object). Expect { success: false, error: string } (not a throw). The error should come from Zod parsing.

2. **createChart — DB error**: Call createChart with valid formData (use chartFormSchema-compatible shape), but mock prisma.chart.create to reject with Error("DB connection lost"). Expect { success: false, error: "Failed to create chart" }.

3. **updateChart — Zod validation failure**: Call updateChart("id", {bad: "data"}). Expect { success: false, error: string }.

4. **updateChart — DB error**: Mock prisma.chart.update to reject. Expect { success: false, error: "Failed to update chart" }.

5. **deleteChart — DB error**: Mock prisma.chart.delete to reject. Expect { success: false, error: "Failed to delete chart" }.

6. **updateChartStatus — invalid status string**: Call updateChartStatus("id", "INVALID_STATUS"). Expect { success: false, error: "Invalid status value" }.

7. **updateChartStatus — DB error**: Mock prisma.project.update to reject. Expect { success: false, error: "Failed to update chart status" }.

For valid formData in tests 2 and 4, construct a minimal valid object:
```typescript
const validFormData = {
  chart: {
    name: "Test Chart",
    designerId: null,
    coverImageUrl: null,
    coverThumbnailUrl: null,
    digitalFileUrl: null,
    stitchCount: 5000,
    stitchCountApproximate: false,
    stitchesWide: 100,
    stitchesHigh: 50,
    genreIds: [],
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null,
    notes: null,
  },
  project: {
    status: "UNSTARTED",
    fabricId: null,
    projectBin: null,
    ipadApp: null,
    needsOnionSkinning: false,
    startDate: null,
    finishDate: null,
    ffoDate: null,
    wantToStartNext: false,
    preferredStartSeason: null,
    startingStitches: 0,
  },
};
```

Use beforeEach to clearAllMocks. Import from @/__tests__/mocks for createMockPrisma.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/lib/actions/chart-actions-errors.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>7 tests pass covering all chart action error branches (Zod failures return structured errors, DB failures return generic messages, invalid status caught)</done>
</task>

<task type="auto">
  <name>Task 2: Upload action failure mode tests</name>
  <files>src/lib/actions/upload-actions.test.ts</files>
  <action>
Create new test file src/lib/actions/upload-actions.test.ts. Mock dependencies:

```typescript
vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));
const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
```

For R2, mock the module to control whether it throws (simulating not-configured):
```typescript
const mockSend = vi.fn();
const mockGetR2Client = vi.fn();
vi.mock("@/lib/r2", () => ({
  getR2Client: (...args: unknown[]) => mockGetR2Client(...args),
  R2_BUCKET_NAME: "test-bucket",
}));
```

Also mock @aws-sdk/s3-request-presigner and sharp:
```typescript
vi.mock("@aws-sdk/s3-request-presigner", () => ({
  getSignedUrl: vi.fn().mockResolvedValue("https://presigned.example.com/test"),
}));
vi.mock("sharp", () => ({ default: vi.fn() }));
```

Mock nanoid:
```typescript
vi.mock("nanoid", () => ({ nanoid: () => "test-nano-id" }));
```

Tests to write:

**Auth guard tests (unauthenticated):**
1. getPresignedUploadUrl throws Unauthorized — temporarily override auth mock using a separate describe or test-level mock reset

Actually, auth guard tests for upload actions should go in a separate file to avoid hoisting conflicts. Skip auth guard tests here since the pattern is identical to chart-actions (requireAuth throws) and already proven. Focus on FAILURE MODES when authenticated.

**getPresignedUploadUrl tests:**
1. **Invalid image type for covers**: Call with { fileName: "test.exe", contentType: "application/x-msdownload", category: "covers", projectId: "p1" }. Expect { success: false, error containing "Invalid image type" }.

2. **Invalid file type for files category**: Call with { fileName: "test.exe", contentType: "application/x-msdownload", category: "files", projectId: "p1" }. Expect { success: false, error containing "Invalid file type" }.

3. **R2 not configured (getR2Client throws)**: Mock getR2Client to throw Error("R2 not configured"). Call with valid input { fileName: "photo.png", contentType: "image/png", category: "covers", projectId: "p1" }. Expect { success: false, error containing "not configured" }.

4. **Zod validation failure (missing fields)**: Call with {}. Expect { success: false, error containing "not configured" } (falls into catch-all).

**confirmUpload tests:**
5. **Invalid field name**: Call with { chartId: "c1", field: "hackerField", key: "k1" }. Expect { success: false, error containing "Invalid field" }.

6. **DB error on update**: Call with valid field "coverImageUrl", mock prisma.chart.update to reject. Expect { success: false, error: "Failed to confirm upload" }.

**deleteFile tests:**
7. **R2 client throws**: Mock getR2Client to return { send: mockSend } where mockSend rejects. Expect { success: false, error: "Failed to delete file" }.

Use beforeEach to reset mocks. Configure mockGetR2Client default to return { send: mockSend } where mockSend resolves.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/lib/actions/upload-actions.test.ts --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>7 tests pass covering upload action error paths (invalid types rejected, R2-not-configured gracefully handled, invalid fields rejected, DB errors caught)</done>
</task>

<task type="auto">
  <name>Task 3: Form component error state tests</name>
  <files>src/components/features/charts/chart-add-form.test.tsx</files>
  <action>
Extend the existing chart-add-form.test.tsx with new tests in the existing describe block. The file already has mockCreateChart and mockUpdateChart wired up — use those.

Tests to add:

1. **Server action returns error — displays form-level error**: Mock mockCreateChart to resolve with { success: false, error: "Failed to create chart" }. Fill in valid name + stitch count, submit. Expect the error message "Failed to create chart" to appear in the DOM (the form renders form.errors._form in an alert/div).

2. **Unexpected throw — displays generic error**: Mock mockCreateChart to reject with Error("Network failure"). Fill in valid name + stitch count, submit. Expect "An unexpected error occurred" to appear (this is the catch block in use-chart-form.ts line 241).

3. **Submit button disabled during pending state**: Mock mockCreateChart to return a never-resolving promise (new Promise(() => {})). Submit valid form. Expect the submit button to be disabled (isPending = true sets disabled on button). Note: check if the button actually has disabled attribute — look at the form component to verify. If it uses isPending for aria-disabled or similar, adjust the assertion.

4. **Error clears when field is corrected**: Submit with empty name to trigger validation error "Chart name is required". Then type a name. Expect the error message to disappear (setField clears errors for that path).

For tests 1-3, fill in minimum valid data before submitting: type "Test Chart" into name field, type "5000" into stitch count field, then click submit.

Use the existing `userEvent.setup()` pattern from the file. Use `waitFor` for async assertions.
  </action>
  <verify>
    <automated>cd /Users/wanderskye/Projects/cross-stitch-tracker && npx vitest run src/components/features/charts/chart-add-form.test.tsx --reporter=verbose 2>&1 | tail -30</automated>
  </verify>
  <done>4 new tests pass: server error displayed, unexpected throw shows generic message, pending state disables button, error clears on field edit. All existing 5 tests still pass.</done>
</task>

</tasks>

<verification>
Run the full test suite to confirm no regressions:
```bash
cd /Users/wanderskye/Projects/cross-stitch-tracker && npm test 2>&1 | tail -20
```
All tests pass including the ~41 existing tests plus ~18 new failure-mode tests.
</verification>

<success_criteria>
- chart-actions-errors.test.ts: 7 tests covering Zod validation errors, DB errors, invalid status
- upload-actions.test.ts: 7 tests covering invalid types, R2 not configured, invalid fields, DB errors
- chart-add-form.test.tsx: 4 new tests (9 total) covering server errors, throws, pending state, error clearing
- npm test passes with 0 failures
</success_criteria>

<output>
After completion, create `.planning/quick/260329-ora-add-failure-mode-tests-for-existing-code/260329-ora-SUMMARY.md`
</output>
