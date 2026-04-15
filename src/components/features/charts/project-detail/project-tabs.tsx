"use client";

import { useQueryState, parseAsStringLiteral } from "nuqs";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { TAB_VALUES, type TabValue } from "./types";

interface ProjectTabsProps {
  overviewContent: React.ReactNode;
  suppliesContent: React.ReactNode;
}

export function ProjectTabs({
  overviewContent,
  suppliesContent,
}: ProjectTabsProps) {
  const [tab, setTab] = useQueryState(
    "tab",
    parseAsStringLiteral([...TAB_VALUES]).withDefault("overview"),
  );

  return (
    <Tabs value={tab} onValueChange={(val) => setTab(val as TabValue)}>
      <TabsList variant="line">
        <TabsTrigger value="overview" className="min-h-11">
          Overview
        </TabsTrigger>
        <TabsTrigger value="supplies" className="min-h-11">
          Supplies
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-6">
        {overviewContent}
      </TabsContent>
      <TabsContent value="supplies" className="pt-6">
        {suppliesContent}
      </TabsContent>
    </Tabs>
  );
}
