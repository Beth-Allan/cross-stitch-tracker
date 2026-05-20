import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/__tests__/test-utils";
import { InlineCreateDialog } from "./inline-create-dialog";

// Mock the Dialog components to render inline for testing
vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ children, open }: { children: React.ReactNode; open: boolean }) =>
    open ? <div data-testid="dialog">{children}</div> : null,
  DialogContent: ({ children }: { children: React.ReactNode; showCloseButton?: boolean }) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: { children: React.ReactNode }) => (
    <h2 data-testid="dialog-title">{children}</h2>
  ),
  DialogDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="dialog-description">{children}</p>
  ),
  DialogFooter: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}));

describe("InlineCreateDialog", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    supplyType: "THREAD" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dialog when open=true with contextual title", () => {
    render(<InlineCreateDialog {...defaultProps} />);
    expect(screen.getByText("Create Thread")).toBeInTheDocument();
  });

  it("does not render when open=false", () => {
    render(<InlineCreateDialog {...defaultProps} open={false} />);
    expect(screen.queryByText("Create Thread")).not.toBeInTheDocument();
  });

  it("has Name input field (required)", () => {
    render(<InlineCreateDialog {...defaultProps} />);
    expect(screen.getByLabelText("Color Name")).toBeInTheDocument();
  });

  it("has Code input field (optional)", () => {
    render(<InlineCreateDialog {...defaultProps} />);
    expect(screen.getByLabelText("Color Code")).toBeInTheDocument();
  });

  it("has 'Create & Add' submit button", () => {
    render(<InlineCreateDialog {...defaultProps} />);
    expect(screen.getByRole("button", { name: "Create & Add" })).toBeInTheDocument();
  });

  it("has Cancel button that calls onClose", () => {
    render(<InlineCreateDialog {...defaultProps} />);
    const cancelButton = screen.getByRole("button", { name: "Cancel" });
    fireEvent.click(cancelButton);
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("submit calls onSubmit with correct data", async () => {
    render(<InlineCreateDialog {...defaultProps} />);

    const nameInput = screen.getByLabelText("Color Name");
    const codeInput = screen.getByLabelText("Color Code");

    fireEvent.change(nameInput, { target: { value: "Custom Thread" } });
    fireEvent.change(codeInput, { target: { value: "CT-001" } });

    const submitButton = screen.getByRole("button", { name: "Create & Add" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(defaultProps.onSubmit).toHaveBeenCalledWith({
        name: "Custom Thread",
        code: "CT-001",
        brandId: "default",
        hexColor: "#808080",
      });
    });
  });

  it("empty name shows validation error", async () => {
    render(<InlineCreateDialog {...defaultProps} />);

    const submitButton = screen.getByRole("button", { name: "Create & Add" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("whitespace-only name shows validation error (trim validation)", async () => {
    render(<InlineCreateDialog {...defaultProps} />);

    const nameInput = screen.getByLabelText("Color Name");
    fireEvent.change(nameInput, { target: { value: "   " } });

    const submitButton = screen.getByRole("button", { name: "Create & Add" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
    });
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it("pre-fills code from defaultCode prop", () => {
    render(<InlineCreateDialog {...defaultProps} defaultCode="ABC" />);
    const codeInput = screen.getByLabelText("Color Code") as HTMLInputElement;
    expect(codeInput.value).toBe("ABC");
  });

  it("resets form fields when dialog opens", () => {
    const { rerender } = render(<InlineCreateDialog {...defaultProps} open={false} />);

    // Open the dialog
    rerender(<InlineCreateDialog {...defaultProps} open={true} />);

    const nameInput = screen.getByLabelText("Color Name") as HTMLInputElement;
    expect(nameInput.value).toBe("");
  });

  describe("contextual labels per supply type (UX-08)", () => {
    it("THREAD type shows 'Create Thread' title, 'Color Name' label, and 'Color Code' label", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="THREAD" />);
      expect(screen.getByText("Create Thread")).toBeInTheDocument();
      expect(screen.getByLabelText("Color Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Color Code")).toBeInTheDocument();
    });

    it("BEAD type shows 'Create Bead' title, 'Bead Name' label, and 'Product Code' label", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="BEAD" />);
      expect(screen.getByText("Create Bead")).toBeInTheDocument();
      expect(screen.getByLabelText("Bead Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Product Code")).toBeInTheDocument();
    });

    it("SPECIALTY type shows 'Create Specialty Item' title, 'Product Name' label, and 'Product Code' label", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="SPECIALTY" />);
      expect(screen.getByText("Create Specialty Item")).toBeInTheDocument();
      expect(screen.getByLabelText("Product Name")).toBeInTheDocument();
      expect(screen.getByLabelText("Product Code")).toBeInTheDocument();
    });

    it("THREAD name placeholder is 'e.g. Christmas Red'", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="THREAD" />);
      expect(screen.getByPlaceholderText("e.g. Christmas Red")).toBeInTheDocument();
    });

    it("BEAD code placeholder is 'e.g. 02013 (optional)'", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="BEAD" />);
      expect(screen.getByPlaceholderText("e.g. 02013 (optional)")).toBeInTheDocument();
    });

    it("SPECIALTY name placeholder is 'e.g. Kreinik Braid'", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="SPECIALTY" />);
      expect(screen.getByPlaceholderText("e.g. Kreinik Braid")).toBeInTheDocument();
    });

    it("description still uses contextual type label", () => {
      render(<InlineCreateDialog {...defaultProps} supplyType="BEAD" />);
      expect(screen.getByText(/Create a new bead and add it to the table/)).toBeInTheDocument();
    });
  });
});
