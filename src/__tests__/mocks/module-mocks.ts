/**
 * Module mock helpers.
 *
 * NOTE: vi.mock() calls are hoisted by Vitest and must remain in each test file.
 * These helpers provide the mock OBJECTS that go inside vi.mock factory functions,
 * reducing duplication of the mock shape while respecting Vitest's hoisting rules.
 *
 * Usage in test files:
 *
 * ```ts
 * import { createMockPrisma, createMockRouter } from "@/__tests__/mocks";
 *
 * const mockRouter = createMockRouter();
 * vi.mock("next/navigation", () => ({
 *   useRouter: () => mockRouter,
 * }));
 *
 * const mockPrisma = createMockPrisma();
 * vi.mock("@/lib/db", () => ({ prisma: mockPrisma }));
 * ```
 */

// All mock object creators are exported from factories.ts.
// This file documents the standard vi.mock patterns used across the test suite.

export const MOCK_PATTERNS = {
  navigation: `vi.mock("next/navigation", () => ({ useRouter: () => mockRouter }))`,
  chartActions: `vi.mock("@/lib/actions/chart-actions", () => ({ createChart: (...args) => mockCreateChart(...args), updateChart: (...args) => mockUpdateChart(...args) }))`,
  designerActions: `vi.mock("@/lib/actions/designer-actions", () => ({ createDesigner: vi.fn() }))`,
  genreActions: `vi.mock("@/lib/actions/genre-actions", () => ({ createGenre: vi.fn() }))`,
  uploadActions: `vi.mock("@/lib/actions/upload-actions", () => ({ getPresignedUploadUrl: vi.fn() }))`,
  auth: `vi.mock("@/lib/auth", () => ({ auth: vi.fn().mockResolvedValue(null) }))`,
  db: `vi.mock("@/lib/db", () => ({ prisma: mockPrisma }))`,
  cache: `vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }))`,
} as const;
