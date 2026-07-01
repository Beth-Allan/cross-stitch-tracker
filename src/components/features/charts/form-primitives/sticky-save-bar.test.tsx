import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { StickySaveBar } from "./sticky-save-bar";

describe("StickySaveBar", () => {
  const defaultProps = {
    chartName: "",
    onSaveDraft: vi.fn(),
    onSubmit: vi.fn(),
    isSubmitting: false,
    isSavingDraft: false,
    saveDraftLabel: "Save Draft",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "Enter a chart name to enable saving" when chartName is empty', () => {
    render(<StickySaveBar {...defaultProps} />);
    expect(screen.getByText("Enter a chart name to enable saving")).toBeInTheDocument();
  });

  it('renders "Ready to save at any point" when chartName is non-empty', () => {
    render(<StickySaveBar {...defaultProps} chartName="My Chart" />);
    expect(screen.getByText("Ready to save at any point")).toBeInTheDocument();
  });

  it("Save Draft and Create buttons are disabled when chartName is empty", () => {
    render(<StickySaveBar {...defaultProps} />);
    expect(screen.getByRole("button", { name: /save draft/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).toBeDisabled();
  });

  it("Save Draft and Create buttons are enabled when chartName is non-empty", () => {
    render(<StickySaveBar {...defaultProps} chartName="Test" />);
    expect(screen.getByRole("button", { name: /save draft/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /create/i })).not.toBeDisabled();
  });

  it("clicking Save Draft calls onSaveDraft callback", async () => {
    const user = userEvent.setup();
    const onSaveDraft = vi.fn();
    render(<StickySaveBar {...defaultProps} chartName="Test" onSaveDraft={onSaveDraft} />);

    await user.click(screen.getByRole("button", { name: /save draft/i }));
    expect(onSaveDraft).toHaveBeenCalledOnce();
  });

  it("clicking Create calls onSubmit callback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<StickySaveBar {...defaultProps} chartName="Test" onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: /create/i }));
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('Save Draft button has type="button"', () => {
    render(<StickySaveBar {...defaultProps} chartName="Test" />);
    const saveDraft = screen.getByRole("button", { name: /save draft/i });
    expect(saveDraft).toHaveAttribute("type", "button");
  });

  it('Create button shows "Creating..." when isSubmitting is true', () => {
    render(<StickySaveBar {...defaultProps} chartName="Test" isSubmitting={true} />);
    expect(screen.getByRole("button", { name: /creating/i })).toBeInTheDocument();
  });

  it('bar has role="toolbar" and aria-label="Form actions"', () => {
    render(<StickySaveBar {...defaultProps} />);
    const toolbar = screen.getByRole("toolbar", { name: /form actions/i });
    expect(toolbar).toBeInTheDocument();
  });

  describe("edit mode", () => {
    it('when mode="edit", primary button shows "Save Changes"', () => {
      render(<StickySaveBar {...defaultProps} chartName="Test" mode="edit" />);
      expect(screen.getByRole("button", { name: /save changes/i })).toBeInTheDocument();
    });

    it('when mode="edit" and isSubmitting, shows "Saving..."', () => {
      render(<StickySaveBar {...defaultProps} chartName="Test" mode="edit" isSubmitting={true} />);
      expect(screen.getByRole("button", { name: /saving/i })).toBeInTheDocument();
    });

    it('when mode="edit", Save Draft button is not rendered', () => {
      render(<StickySaveBar {...defaultProps} chartName="Test" mode="edit" />);
      expect(screen.queryByText("Save Draft")).not.toBeInTheDocument();
    });

    it("when mode is undefined (default), renders as before with Create and Save Draft", () => {
      render(<StickySaveBar {...defaultProps} chartName="Test" />);
      expect(screen.getByRole("button", { name: /create/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /save draft/i })).toBeInTheDocument();
    });
  });
});
