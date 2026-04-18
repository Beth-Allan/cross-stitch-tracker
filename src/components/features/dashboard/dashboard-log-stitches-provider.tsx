"use client";

import { useCallback } from "react";

interface DashboardLogStitchesProviderProps {
  children: (onLogStitches: () => void) => React.ReactNode;
}

/**
 * Client-side provider that bridges the server page component with
 * the QuickAddMenu's "Log Stitches" action.
 *
 * Dispatches a custom DOM event that TopBar listens for (wired in Plan 08)
 * to open the existing LogSessionModal.
 */
export function DashboardLogStitchesProvider({
  children,
}: DashboardLogStitchesProviderProps) {
  const handleLogStitches = useCallback(() => {
    window.dispatchEvent(new CustomEvent("open-log-session-modal"));
  }, []);

  return <>{children(handleLogStitches)}</>;
}
