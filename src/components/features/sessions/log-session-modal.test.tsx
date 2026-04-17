import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@/__tests__/test-utils";
import userEvent from "@testing-library/user-event";
import { LogSessionModal } from "./log-session-modal";
import type { ActiveProjectForPicker } from "@/types/session";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockCreateSession = vi.fn();
const mockUpdateSession = vi.fn();
const mockDeleteSession = vi.fn();
const mockGetPresignedUploadUrl = vi.fn();

vi.mock("@/lib/actions/session-actions", () => ({
  createSession: (...args: unknown[]) => mockCreateSession(...args),
  updateSession: (...args: unknown[]) => mockUpdateSession(...args),
  deleteSession: (...args: unknown[]) => mockDeleteSession(...args),
}));

vi.mock("@/lib/actions/upload-actions", () => ({
  getPresignedUploadUrl: (...args: unknown[]) => mockGetPresignedUploadUrl(...args),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

// ─── Test Data ──────────────────────────────────────────────────────────────

const mockProjects: ActiveProjectForPicker[] = [
  {
    projectId: "proj-1",
    chartId: "chart-1",
    chartName: "Autumn Sampler",
    coverThumbnailUrl: "covers/chart-1/thumb.webp",
    status: "IN_PROGRESS",
    stitchesCompleted: 2500,
    totalStitches: 10000,
  },
  {
    projectId: "proj-2",
    chartId: "chart-2",
    chartName: "Winter Wonderland",
    coverThumbnailUrl: null,
    status: "KITTED",
    stitchesCompleted: 0,
    totalStitches: 25000,
  },
];

const mockImageUrls: Record<string, string> = {
  "covers/chart-1/thumb.webp": "https://r2.example.com/signed/thumb.webp",
};

const editSession = {
  id: "session-1",
  projectId: "proj-1",
  date: "2026-04-10",
  stitchCount: 150,
  timeSpentMinutes: 90,
  photoKey: null,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderModal(
  overrides?: Partial<React.ComponentProps<typeof LogSessionModal>>,
) {
  const defaultProps = {
    isOpen: true,
    onOpenChange: vi.fn(),
    activeProjects: mockProjects,
    imageUrls: mockImageUrls,
  };

  return render(<LogSessionModal {...defaultProps} {...overrides} />);
}

/** Get the save button by its specific role + text (not the title) */
function getSaveButton(name: RegExp = /log stitches/i) {
  return screen.getByRole("button", { name });
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("LogSessionModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to ensure consistent "today" in tests
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("create mode", () => {
    it('renders "Log Stitches" title when no editSession prop', () => {
      renderModal();
      // Title is in the heading role, distinct from the save button
      const heading = screen.getByRole("heading", { name: /log stitches/i });
      expect(heading).toBeInTheDocument();
    });

    it("shows project picker when no lockedProjectId prop", () => {
      renderModal();
      expect(screen.getByText("Select a project...")).toBeInTheDocument();
    });

    it("save button is disabled when projectId is empty", () => {
      renderModal();
      expect(getSaveButton()).toBeDisabled();
    });

    it("save button is disabled when stitchCount is empty", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderModal();

      // Select a project first
      await user.click(screen.getByText("Select a project..."));
      await user.click(screen.getByText("Autumn Sampler"));

      // Save should still be disabled since stitch count is empty
      expect(getSaveButton()).toBeDisabled();
    });

    it("save button is enabled when projectId and stitchCount are filled", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderModal();

      // Select a project
      await user.click(screen.getByText("Select a project..."));
      await user.click(screen.getByText("Autumn Sampler"));

      // Enter stitch count
      const stitchInput = screen.getByLabelText(/stitch count/i);
      await user.type(stitchInput, "200");

      expect(getSaveButton()).toBeEnabled();
    });

    it("date defaults to today", () => {
      renderModal();
      const dateInput = screen.getByLabelText(/date/i);
      expect(dateInput).toHaveValue("2026-04-15");
    });

    it("calls createSession on save in create mode", async () => {
      vi.useRealTimers(); // startTransition needs real timers
      const user = userEvent.setup();
      mockCreateSession.mockResolvedValue({ success: true, session: { id: "new-1" } });

      // Need to mock Date.now for the date default since we switched to real timers
      const originalToISOString = Date.prototype.toISOString;
      Date.prototype.toISOString = function () {
        return "2026-04-15T12:00:00.000Z";
      };

      renderModal();

      // Select a project
      await user.click(screen.getByText("Select a project..."));
      await user.click(screen.getByText("Autumn Sampler"));

      // Enter stitch count
      const stitchInput = screen.getByLabelText(/stitch count/i);
      await user.type(stitchInput, "200");

      // Save
      await user.click(getSaveButton());

      await waitFor(() => {
        expect(mockCreateSession).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: "proj-1",
            stitchCount: 200,
          }),
        );
      });

      Date.prototype.toISOString = originalToISOString;
    });

    it('does not show "Delete session" link in create mode', () => {
      renderModal();
      expect(screen.queryByText("Delete session")).not.toBeInTheDocument();
    });
  });

  describe("edit mode", () => {
    it('renders "Edit Session" title when editSession prop is provided', () => {
      renderModal({ editSession });
      const heading = screen.getByRole("heading", { name: /edit session/i });
      expect(heading).toBeInTheDocument();
    });

    it("calls updateSession on save in edit mode", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      mockUpdateSession.mockResolvedValue({ success: true, session: { id: "session-1" } });
      renderModal({ editSession, lockedProjectId: "proj-1" });

      // Modify stitch count
      const stitchInput = screen.getByLabelText(/stitch count/i);
      await user.clear(stitchInput);
      await user.type(stitchInput, "300");

      // Save
      await user.click(screen.getByRole("button", { name: /save changes/i }));

      await waitFor(() => {
        expect(mockUpdateSession).toHaveBeenCalledWith(
          "session-1",
          expect.objectContaining({
            stitchCount: 300,
          }),
        );
      });
    });

    it('shows "Delete session" link in edit mode', () => {
      renderModal({ editSession });
      expect(screen.getByText("Delete session")).toBeInTheDocument();
    });

    it('shows "Delete? Yes / No" inline confirmation on delete click', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      renderModal({ editSession });

      await user.click(screen.getByText("Delete session"));

      expect(screen.getByText("Delete?")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
    });

    it("calls deleteSession when confirming delete", async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      mockDeleteSession.mockResolvedValue({ success: true });
      renderModal({ editSession });

      await user.click(screen.getByText("Delete session"));
      await user.click(screen.getByRole("button", { name: "Yes" }));

      await waitFor(() => {
        expect(mockDeleteSession).toHaveBeenCalledWith("session-1");
      });
    });

    it("pre-populates time fields from timeSpentMinutes", () => {
      renderModal({ editSession: { ...editSession, timeSpentMinutes: 90 } });

      const hoursInput = screen.getByLabelText(/hours/i);
      const minutesInput = screen.getByLabelText(/minutes/i);

      expect(hoursInput).toHaveValue(1);
      expect(minutesInput).toHaveValue(30);
    });
  });

  describe("locked project mode", () => {
    it("hides project picker when lockedProjectId is provided", () => {
      renderModal({ lockedProjectId: "proj-1" });
      expect(screen.queryByText("Select a project...")).not.toBeInTheDocument();
    });
  });
});
