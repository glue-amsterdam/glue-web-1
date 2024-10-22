"use client";

import { useState } from "react";
/* import { useFormContext } from "react-hook-form"; */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
/* import { DatabaseContent } from "@/utils/about-types"; */
import CitizensForm from "@/app/admin/forms/citizens-form";
import CuratedMembersForm from "@/app/admin/forms/curated-members-form";
import InfoItemsForm from "@/app/admin/forms/info-items-form";
import PressItemsForm from "@/app/admin/forms/press-items-form";
import SponsorsForm from "@/app/admin/forms/sponsors-form";

export default function AboutSectionForm() {
  const [activeTab, setActiveTab] = useState("citizens");
  /*   const { watch } = useFormContext<{ aboutSection: DatabaseContent }>(); */

  /* const aboutData = watch("aboutSection"); */

  return (
    <div className="space-y-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <TabsTrigger value="citizens" className="text-sm">
            Citizens
          </TabsTrigger>
          <TabsTrigger value="curated" className="text-sm">
            Curated
          </TabsTrigger>
          <TabsTrigger value="info" className="text-sm">
            Info
          </TabsTrigger>
          <TabsTrigger value="press" className="text-sm">
            Press
          </TabsTrigger>
          <TabsTrigger value="sponsors" className="text-sm">
            Sponsors
          </TabsTrigger>
        </TabsList>

        <TabsContent value="citizens">
          <CitizensForm />
        </TabsContent>
        <TabsContent value="curated">
          <CuratedMembersForm />
        </TabsContent>
        <TabsContent value="info">
          <InfoItemsForm />
        </TabsContent>
        <TabsContent value="press">
          <PressItemsForm />
        </TabsContent>
        <TabsContent value="sponsors">
          <SponsorsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
