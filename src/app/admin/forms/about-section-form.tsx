"use client";

import { useState } from "react";
import { Tabs } from "@/components/ui/tabs";
import AboutTabList from "@/app/admin/components/about-tabs-list";
import AboutTabsContent from "@/app/admin/components/about-tabs-content";

export default function AboutSectionForm() {
  const [activeTab, setActiveTab] = useState("citizens");

  return (
    <Tabs
      value={activeTab}
      onValueChange={setActiveTab}
      className="flex flex-col gap-2 "
    >
      <AboutTabList />
      <AboutTabsContent />
    </Tabs>
  );
}
