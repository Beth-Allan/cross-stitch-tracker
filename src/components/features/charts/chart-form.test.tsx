import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ChartForm } from "./chart-form";

// Mock server actions to prevent actual server calls
vi.mock("@/lib/actions/chart-actions", () => ({
  createChart: vi.fn(),
  updateChart: vi.fn(),
}));
vi.mock("@/lib/actions/designer-actions", () => ({
  createDesigner: vi.fn(),
  getDesigners: vi.fn(),
}));
vi.mock("@/lib/actions/genre-actions", () => ({
  createGenre: vi.fn(),
  getGenres: vi.fn(),
}));
vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("ChartForm", () => {
  it("renders all 7 form sections in add mode", () => {
    render(<ChartForm mode="add" designers={[]} genres={[]} />);
    // Use getAllByText for sections that may match multiple elements
    expect(screen.getByText("Basic Info")).toBeInTheDocument();
    expect(screen.getByText("Stitch Count & Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Genre(s)")).toBeInTheDocument();
    expect(screen.getByText("Pattern Type")).toBeInTheDocument();
    expect(screen.getByText("Project Setup")).toBeInTheDocument();
    expect(screen.getByText("Dates")).toBeInTheDocument();
    expect(screen.getByText("Goals & Planning")).toBeInTheDocument();
  });

  it("shows Add Chart button in add mode", () => {
    render(<ChartForm mode="add" designers={[]} genres={[]} />);
    expect(screen.getByRole("button", { name: /add chart/i })).toBeInTheDocument();
  });

  it("shows Save Changes button in edit mode", () => {
    render(<ChartForm mode="edit" designers={[]} genres={[]} />);
    expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
  });
});
