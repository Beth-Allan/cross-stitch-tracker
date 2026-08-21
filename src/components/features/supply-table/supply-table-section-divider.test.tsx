import { describe, it, expect } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import { SupplyTableSectionDivider } from "./supply-table-section-divider";

const MockIcon = ({ className }: { className?: string }) => (
  <span data-testid="icon" className={className} />
);

function renderDivider(props: { icon?: typeof MockIcon; label?: string; count: number }) {
  return render(
    <table>
      <tbody>
        <SupplyTableSectionDivider
          icon={props.icon ?? MockIcon}
          label={props.label ?? "Thread"}
          count={props.count}
        />
      </tbody>
    </table>,
  );
}

describe("SupplyTableSectionDivider", () => {
  it("renders null when count is 0 (hidden when section is empty)", () => {
    renderDivider({ count: 0 });
    expect(screen.queryByText("Thread")).not.toBeInTheDocument();
  });

  it("renders icon, label text, and count badge when count > 0", () => {
    renderDivider({ count: 5, label: "Thread" });
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Thread")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders count badge with correct number", () => {
    renderDivider({ count: 42 });
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("renders a single td with colSpan=7", () => {
    const { container } = renderDivider({ count: 3 });
    const td = container.querySelector("td");
    expect(td).toBeInTheDocument();
    expect(td).toHaveAttribute("colSpan", "7");
  });

  it("label text is uppercase with correct tracking", () => {
    renderDivider({ count: 1, label: "Beads" });
    const labelContainer = screen.getByText("Beads").closest("div");
    expect(labelContainer?.className).toContain("uppercase");
    expect(labelContainer?.className).toContain("tracking-[0.05em]");
  });

  it("accepts custom icon component and renders it", () => {
    const CustomIcon = ({ className }: { className?: string }) => (
      <span data-testid="custom-icon" className={className} />
    );
    renderDivider({ icon: CustomIcon, count: 2 });
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });
});
