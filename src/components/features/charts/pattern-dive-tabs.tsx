"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import { Search, Star, Layers, MapPin } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const PATTERN_DIVE_TABS = ["browse", "whats-next", "fabric", "storage"] as const;
export type PatternDiveTab = (typeof PATTERN_DIVE_TABS)[number];

const TAB_CONFIG = [
  { value: "browse" as const, label: "Browse", icon: Search },
  { value: "whats-next" as const, label: "What's Next", icon: Star },
  { value: "fabric" as const, label: "Fabric Requirements", icon: Layers },
  { value: "storage" as const, label: "Storage View", icon: MapPin },
] as const;

interface PatternDiveTabsProps {
  browseContent: React.ReactNode;
  whatsNextContent: React.ReactNode;
  fabricContent: React.ReactNode;
  storageContent: React.ReactNode;
}

export function PatternDiveTabs({
  browseContent,
  whatsNextContent,
  fabricContent,
  storageContent,
}: PatternDiveTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...PATTERN_DIVE_TABS]).withDefault("browse"),
  );

  const contentMap: Record<PatternDiveTab, React.ReactNode> = {
    browse: browseContent,
    "whats-next": whatsNextContent,
    fabric: fabricContent,
    storage: storageContent,
  };

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as PatternDiveTab)}>
      <TabsList variant="line">
        {TAB_CONFIG.map(({ value, label, icon: Icon }) => (
          <TabsTrigger key={value} value={value} className="min-h-11 gap-1.5">
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </TabsTrigger>
        ))}
      </TabsList>
      {PATTERN_DIVE_TABS.map((tabValue) => (
        <TabsContent key={tabValue} value={tabValue} className="pt-6">
          {contentMap[tabValue]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
