"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const DASHBOARD_TABS = ["library", "progress"] as const;
export type DashboardTab = (typeof DASHBOARD_TABS)[number];

const TAB_CONFIG = [
  { value: "library" as const, label: "Your Library" },
  { value: "progress" as const, label: "Progress" },
] as const;

interface DashboardTabsProps {
  libraryContent: ReactNode;
  progressContent: ReactNode;
}

/**
 * Top-level dashboard tab switcher using nuqs URL state.
 * Switches between "Your Library" (main dashboard) and "Progress" (project dashboard).
 */
export function DashboardTabs({
  libraryContent,
  progressContent,
}: DashboardTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...DASHBOARD_TABS]).withDefault("library"),
  );

  const contentMap: Record<DashboardTab, ReactNode> = {
    library: libraryContent,
    progress: progressContent,
  };

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as DashboardTab)}>
      <TabsList variant="line">
        {TAB_CONFIG.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="min-h-11">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {DASHBOARD_TABS.map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue} className="pt-6">
          {contentMap[tabValue]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
