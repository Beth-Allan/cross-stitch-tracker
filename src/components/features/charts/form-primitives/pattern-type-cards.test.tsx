import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, within } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { PatternTypeCards } from "./pattern-type-cards";

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("PatternTypeCards", () => {
  const defaultProps = {
    isPaperChart: false,
    isFormalKit: false,
    isSAL: false,
    kitColorCount: null as number | null,
    onFormatChange: vi.fn(),
    onFormalKitChange: vi.fn(),
    onSALChange: vi.fn(),
    onKitColorCountChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders 4 cards — 2 radio + 2 checkbox", () => {
    render(<PatternTypeCards {...defaultProps} />);
    const radios = screen.getAllByRole("radio");
    const checkboxes = screen.getAllByRole("checkbox");
    expect(radios).toHaveLength(2);
    expect(checkboxes).toHaveLength(2);
  });

  it("wraps Paper/Digital pair in a radiogroup with accessible name", () => {
    render(<PatternTypeCards {...defaultProps} />);
    const radiogroup = screen.getByRole("radiogroup", { name: /chart format/i });
    expect(radiogroup).toBeInTheDocument();
    const radios = within(radiogroup).getAllByRole("radio");
    expect(radios).toHaveLength(2);
  });

  it("Paper and Digital are mutually exclusive — clicking Paper deselects Digital", async () => {
    const user = userEvent.setup();
    const onFormatChange = vi.fn();
    render(
      <PatternTypeCards {...defaultProps} isPaperChart={false} onFormatChange={onFormatChange} />,
    );

    // Digital should be selected by default (isPaperChart=false)
    const digitalRadio = screen.getByRole("radio", { name: /digital/i });
    const paperRadio = screen.getByRole("radio", { name: /paper/i });
    expect(digitalRadio).toHaveAttribute("aria-checked", "true");
    expect(paperRadio).toHaveAttribute("aria-checked", "false");

    // Click Paper
    await user.click(paperRadio);
    expect(onFormatChange).toHaveBeenCalledWith(true);
  });

  it("clicking Digital when Paper is selected calls onFormatChange(false)", async () => {
    const user = userEvent.setup();
    const onFormatChange = vi.fn();
    render(
      <PatternTypeCards {...defaultProps} isPaperChart={true} onFormatChange={onFormatChange} />,
    );

    const digitalRadio = screen.getByRole("radio", { name: /digital/i });
    await user.click(digitalRadio);
    expect(onFormatChange).toHaveBeenCalledWith(false);
  });

  it("Kit and SAL toggle independently — toggling Kit does not affect SAL", async () => {
    const user = userEvent.setup();
    const onFormalKitChange = vi.fn();
    const onSALChange = vi.fn();
    render(
      <PatternTypeCards
        {...defaultProps}
        onFormalKitChange={onFormalKitChange}
        onSALChange={onSALChange}
      />,
    );

    const kitCheckbox = screen.getByRole("checkbox", { name: /kit/i });
    await user.click(kitCheckbox);
    expect(onFormalKitChange).toHaveBeenCalledWith(true);
    expect(onSALChange).not.toHaveBeenCalled();
  });

  it("Kit and SAL can co-exist with either Paper or Digital", () => {
    render(<PatternTypeCards {...defaultProps} isPaperChart={true} isFormalKit={true} isSAL={true} />);

    const paperRadio = screen.getByRole("radio", { name: /paper/i });
    const kitCheckbox = screen.getByRole("checkbox", { name: /kit/i });
    const salCheckbox = screen.getByRole("checkbox", { name: /sal/i });

    expect(paperRadio).toHaveAttribute("aria-checked", "true");
    expect(kitCheckbox).toHaveAttribute("aria-checked", "true");
    expect(salCheckbox).toHaveAttribute("aria-checked", "true");
  });

  it("selecting Kit expands sub-field — Colours in kit input becomes visible", () => {
    render(<PatternTypeCards {...defaultProps} isFormalKit={true} />);
    const input = screen.getByLabelText(/colours in kit/i);
    expect(input).toBeInTheDocument();
  });

  it("deselecting Kit calls onKitColorCountChange('') to clear value", async () => {
    const user = userEvent.setup();
    const onFormalKitChange = vi.fn();
    const onKitColorCountChange = vi.fn();
    render(
      <PatternTypeCards
        {...defaultProps}
        isFormalKit={true}
        kitColorCount={12}
        onFormalKitChange={onFormalKitChange}
        onKitColorCountChange={onKitColorCountChange}
      />,
    );

    const kitCheckbox = screen.getByRole("checkbox", { name: /kit/i });
    await user.click(kitCheckbox);
    expect(onFormalKitChange).toHaveBeenCalledWith(false);
    expect(onKitColorCountChange).toHaveBeenCalledWith("");
  });

  it("Digital is selected by default (isPaperChart=false initial state)", () => {
    render(<PatternTypeCards {...defaultProps} />);
    const digitalRadio = screen.getByRole("radio", { name: /digital/i });
    expect(digitalRadio).toHaveAttribute("aria-checked", "true");
  });

  it("selected cards render Check icon in the check circle", () => {
    const { container } = render(
      <PatternTypeCards {...defaultProps} isPaperChart={false} isFormalKit={true} />,
    );
    // Digital and Kit are selected — should have Check icons (lucide-react renders svg)
    // Unselected cards (Paper, SAL) should not have check icons
    const svgs = container.querySelectorAll("svg");
    // Digital (selected) + Kit (selected) = 2 check icons
    expect(svgs.length).toBe(2);
  });

  it("Kit sub-field input calls onKitColorCountChange with entered value", async () => {
    const user = userEvent.setup();
    const onKitColorCountChange = vi.fn();
    render(
      <PatternTypeCards
        {...defaultProps}
        isFormalKit={true}
        onKitColorCountChange={onKitColorCountChange}
      />,
    );

    const input = screen.getByLabelText(/colours in kit/i);
    await user.type(input, "24");
    expect(onKitColorCountChange).toHaveBeenCalledWith("2");
    expect(onKitColorCountChange).toHaveBeenCalledWith("4");
  });

  it("displays kitColorCount error when provided", () => {
    render(
      <PatternTypeCards
        {...defaultProps}
        isFormalKit={true}
        errors={{ kitColorCount: "Must be a positive number" }}
      />,
    );
    expect(screen.getByText("Must be a positive number")).toBeInTheDocument();
  });
});
