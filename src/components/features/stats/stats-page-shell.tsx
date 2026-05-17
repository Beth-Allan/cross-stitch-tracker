"use client";

import type { ReactNode } from "react";
import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const STATS_TABS = ["overview", "activity", "records"] as const;
export type StatsTab = (typeof STATS_TABS)[number];

const TAB_CONFIG = [
  { value: "overview" as const, label: "Overview" },
  { value: "activity" as const, label: "Activity" },
  { value: "records" as const, label: "Records" },
] as const;

interface StatsPageShellProps {
  overviewContent: ReactNode;
  activityContent?: ReactNode;
  recordsContent?: ReactNode;
}

/**
 * Top-level stats page tab shell using nuqs URL state.
 * Permanent container for phases 19-21: Overview, Activity, Records.
 */
export function StatsPageShell({
  overviewContent,
  activityContent,
  recordsContent,
}: StatsPageShellProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...STATS_TABS]).withDefault("overview"),
  );

  const contentMap: Record<StatsTab, ReactNode> = {
    overview: overviewContent,
    activity: activityContent ?? <PlaceholderTab label="Activity" />,
    records: recordsContent ?? <PlaceholderTab label="Records" />,
  };

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as StatsTab)}>
      <TabsList variant="line">
        {TAB_CONFIG.map(({ value, label }) => (
          <TabsTrigger key={value} value={value} className="min-h-11">
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {STATS_TABS.map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue} className="pt-6">
          {contentMap[tabValue]}
        </TabsContent>
      ))}
    </Tabs>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center text-muted-foreground">
      {label} — coming in a future update
    </div>
  );
}
