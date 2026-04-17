"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SessionTable } from "./session-table";
import { LogSessionModal } from "./log-session-modal";
import type { StitchSessionRow, ActiveProjectForPicker } from "@/types/session";

// ─── Types ──────────────────────────────────────────────────────────────────

interface SessionsPageClientProps {
  sessions: StitchSessionRow[];
  activeProjects: ActiveProjectForPicker[];
  imageUrls: Record<string, string>;
}

// ─── Component ──────────────────────────────────────────────────────────────

export function SessionsPageClient({
  sessions,
  activeProjects,
  imageUrls,
}: SessionsPageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editSession, setEditSession] = useState<{
    id: string;
    projectId: string;
    date: string;
    stitchCount: number;
    timeSpentMinutes: number | null;
    photoKey: string | null;
  } | null>(null);

  const handleEditSession = (session: StitchSessionRow) => {
    setEditSession({
      id: session.id,
      projectId: session.projectId,
      date: session.date.toISOString().split("T")[0],
      stitchCount: session.stitchCount,
      timeSpentMinutes: session.timeSpentMinutes,
      photoKey: session.photoKey,
    });
    setModalOpen(true);
  };

  const handleOpenLog = () => {
    setEditSession(null);
    setModalOpen(true);
  };

  const hasSessions = sessions.length > 0;

  return (
    <div>
      {hasSessions ? (
        <>
          {/* Session count + Log Session button */}
          <div className="mb-3 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
            </p>
            <Button
              onClick={handleOpenLog}
              className="bg-emerald-600 hover:bg-emerald-700"
              size="sm"
            >
              <Plus className="mr-1.5 size-3.5" />
              Log Session
            </Button>
          </div>

          {/* Session table with project name column */}
          <SessionTable
            sessions={sessions}
            imageUrls={imageUrls}
            showProjectName={true}
            onEditSession={handleEditSession}
          />
        </>
      ) : (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-sm">
            No stitching sessions logged yet. Use the Log Stitches button to record your first
            session.
          </p>
          <div className="mt-4">
            <Button onClick={handleOpenLog} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="mr-1.5 size-4" />
              Log Session
            </Button>
          </div>
        </div>
      )}

      {/* Log session modal — no lockedProjectId so full picker shown */}
      <LogSessionModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        activeProjects={activeProjects}
        imageUrls={imageUrls}
        editSession={editSession}
      />
    </div>
  );
}
