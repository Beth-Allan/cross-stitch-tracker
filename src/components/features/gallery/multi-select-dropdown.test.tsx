import { render, screen, fireEvent } from "@/__tests__/test-utils";
import { MultiSelectDropdown } from "./multi-select-dropdown";

const options = [
  { value: "A", label: "Alpha" },
  { value: "B", label: "Bravo" },
  { value: "C", label: "Charlie" },
];

describe("MultiSelectDropdown", () => {
  it("renders label on trigger when nothing selected", () => {
    render(
      <MultiSelectDropdown label="Status" options={options} selected={[]} onToggle={vi.fn()} />,
    );
    expect(screen.getByRole("button", { name: /status/i })).toBeInTheDocument();
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("shows count badge when items are selected", () => {
    render(
      <MultiSelectDropdown
        label="Status"
        options={options}
        selected={["A", "B"]}
        onToggle={vi.fn()}
      />,
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("opens dropdown on click and shows options", () => {
    render(
      <MultiSelectDropdown label="Status" options={options} selected={[]} onToggle={vi.fn()} />,
    );
    // Options not visible initially
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /status/i }));

    // Options now visible
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Bravo")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("calls onToggle with correct value when option clicked", () => {
    const onToggle = vi.fn();
    render(
      <MultiSelectDropdown label="Status" options={options} selected={[]} onToggle={onToggle} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /status/i }));
    fireEvent.click(screen.getByText("Bravo"));

    expect(onToggle).toHaveBeenCalledWith("B");
  });

  it("closes on Escape key", () => {
    render(
      <MultiSelectDropdown label="Status" options={options} selected={[]} onToggle={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /status/i }));
    expect(screen.getByText("Alpha")).toBeInTheDocument();

    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "Escape" });
    expect(screen.queryByText("Alpha")).not.toBeInTheDocument();
  });

  it("applies active styling (emerald border) when items selected", () => {
    const { container } = render(
      <MultiSelectDropdown label="Status" options={options} selected={["A"]} onToggle={vi.fn()} />,
    );
    const trigger = screen.getByRole("button", { name: /status/i });
    expect(trigger.className).toContain("border-emerald-300");
  });

  it("shows checked checkbox for selected options", () => {
    render(
      <MultiSelectDropdown label="Status" options={options} selected={["A"]} onToggle={vi.fn()} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /status/i }));
    // The "Alpha" option should have a checked checkbox visual
    const alphaOption = screen.getByText("Alpha").closest('[role="option"]');
    expect(alphaOption).toBeInTheDocument();
    expect(alphaOption).toHaveAttribute("aria-selected", "true");
    // Visual checkbox is decorative (aria-hidden) — selection state
    // is communicated via aria-selected on the option
    const decorativeCheckbox = alphaOption!.querySelector('[aria-hidden="true"]');
    expect(decorativeCheckbox).toBeInTheDocument();
  });
});
