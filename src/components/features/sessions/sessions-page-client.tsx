"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataUnavailable } from "@/components/ui/data-unavailable";
import { SessionTable } from "./session-table";
import { LogSessionModal } from "./log-session-modal";
import type { StitchSessionRow, ActiveProjectForPicker } from "@/types/session";

interface SessionsPageClientProps {
  /** null when the session query failed -- distinct from [], which means "none logged yet" */
  sessions: StitchSessionRow[] | null;
  activeProjects: ActiveProjectForPicker[];
  projectsUnavailable: boolean;
  imageUrls: Record<string, string>;
}

export function SessionsPageClient({
  sessions,
  activeProjects,
  projectsUnavailable,
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

  const hasSessions = sessions !== null && sessions.length > 0;

  return (
    <div>
      {sessions === null ? (
        <div className="space-y-4">
          <DataUnavailable label="Your sessions" />
          <div className="text-center">
            <Button onClick={handleOpenLog}>
              <Plus className="mr-1.5 size-4" />
              Log Session
            </Button>
          </div>
        </div>
      ) : hasSessions ? (
        <>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} logged
            </p>
            <Button onClick={handleOpenLog} size="sm">
              <Plus className="mr-1.5 size-3.5" />
              Log Session
            </Button>
          </div>

          <SessionTable
            sessions={sessions}
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
            <Button onClick={handleOpenLog}>
              <Plus className="mr-1.5 size-4" />
              Log Session
            </Button>
          </div>
        </div>
      )}

      <LogSessionModal
        isOpen={modalOpen}
        onOpenChange={setModalOpen}
        activeProjects={activeProjects}
        projectsUnavailable={projectsUnavailable}
        imageUrls={imageUrls}
        editSession={editSession}
      />
    </div>
  );
}
