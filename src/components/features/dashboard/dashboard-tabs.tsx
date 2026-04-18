"use client";

import type { ReactNode } from "react";

export const DASHBOARD_TABS = ["library", "progress"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

interface DashboardTabsProps {
  libraryContent: ReactNode;
  progressContent: ReactNode;
}

/**
 * Stub — will be implemented in Task 2.
 */
export function DashboardTabs(_props: DashboardTabsProps) {
  return null;
}
