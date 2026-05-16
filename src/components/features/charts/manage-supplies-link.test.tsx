import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { ManageSuppliesLink } from "./manage-supplies-link";

describe("ManageSuppliesLink", () => {
  it('renders "Supplies are managed on the project page" text', () => {
    render(<ManageSuppliesLink chartId="test-chart-id" />);
    expect(
      screen.getByText("Supplies are managed on the project page"),
    ).toBeInTheDocument();
  });

  it("renders 'Go to Supplies' link pointing to /charts/{chartId}?tab=supplies", () => {
    render(<ManageSuppliesLink chartId="test-chart-id" />);
    const link = screen.getByRole("link", { name: /go to supplies/i });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "/charts/test-chart-id?tab=supplies",
    );
  });

  it('renders ArrowRight icon with aria-hidden="true"', () => {
    render(<ManageSuppliesLink chartId="test-chart-id" />);
    const link = screen.getByRole("link", { name: /go to supplies/i });
    // The ArrowRight SVG should be inside the link with aria-hidden
    const svg = link.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("aria-hidden", "true");
  });

  it("link has text-primary class and hover:underline", () => {
    render(<ManageSuppliesLink chartId="test-chart-id" />);
    const link = screen.getByRole("link", { name: /go to supplies/i });
    expect(link.className).toContain("text-primary");
    expect(link.className).toContain("hover:underline");
  });
});
