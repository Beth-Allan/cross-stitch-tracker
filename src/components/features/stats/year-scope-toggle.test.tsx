import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { YearScopeToggle } from "./year-scope-toggle";

describe("YearScopeToggle", () => {
  const defaultYears = [2026, 2025, 2024];

  it("renders All-time button and year buttons for each available year", () => {
    render(<YearScopeToggle availableYears={defaultYears} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("button", { name: /All-time/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2026" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2025" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "2024" })).toBeInTheDocument();
  });

  it("has role group with accessible label", () => {
    render(<YearScopeToggle availableYears={defaultYears} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("group", { name: /Time scope/i })).toBeInTheDocument();
  });

  it("active scope button has aria-pressed true", () => {
    render(<YearScopeToggle availableYears={defaultYears} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    const allTimeBtn = screen.getByRole("button", { name: /All-time/i });
    expect(allTimeBtn).toHaveAttribute("aria-pressed", "true");

    const yearBtn = screen.getByRole("button", { name: "2026" });
    expect(yearBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("clicking a year button updates the URL scope param", async () => {
    const onUrlUpdate = vi.fn();
    const { user } = render(<YearScopeToggle availableYears={defaultYears} />, {
      wrapper: withNuqsTestingAdapter({
        onUrlUpdate,
      }),
    });

    await user.click(screen.getByRole("button", { name: "2026" }));

    expect(onUrlUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        searchParams: expect.any(URLSearchParams),
      }),
    );
  });

  it("shows selected year as active when scope is set via URL", () => {
    render(<YearScopeToggle availableYears={defaultYears} />, {
      wrapper: withNuqsTestingAdapter({ searchParams: "?scope=2025" }),
    });

    const yearBtn = screen.getByRole("button", { name: "2025" });
    expect(yearBtn).toHaveAttribute("aria-pressed", "true");

    const allTimeBtn = screen.getByRole("button", { name: /All-time/i });
    expect(allTimeBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders empty state gracefully with no years", () => {
    render(<YearScopeToggle availableYears={[]} />, {
      wrapper: withNuqsTestingAdapter(),
    });

    expect(screen.getByRole("button", { name: /All-time/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
