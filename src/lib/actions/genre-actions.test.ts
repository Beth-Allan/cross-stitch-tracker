import { describe, expect, it, vi, beforeEach } from "vitest";
import { createMockPrisma } from "@/__tests__/mocks";

vi.mock("@/lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-1", name: "Test", email: "test@test.com" } }),
}));

const mockPrisma = createMockPrisma();
vi.mock("@/lib/db", () => ({
  prisma: mockPrisma,
}));

describe("genre-actions error handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("getGenres returns empty array and logs on Prisma error", async () => {
    const { getGenres } = await import("./genre-actions");
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    mockPrisma.genre.findMany.mockRejectedValueOnce(new Error("DB connection lost"));

    const result = await getGenres();

    expect(result).toEqual([]);
    expect(consoleSpy).toHaveBeenCalledWith("getGenres error:", expect.any(Error));
    consoleSpy.mockRestore();
  });
});
