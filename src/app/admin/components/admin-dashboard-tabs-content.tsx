import AboutSectionForm from "@/app/admin/forms/about-section-form";
import MainSectionForm from "@/app/admin/forms/main-section-form";
import PlanSectionsForm from "@/app/admin/forms/plans-section-form";
import { TabsContent } from "@/components/ui/tabs";
import React from "react";

function AdminDashboardTabsContent() {
  return (
    <>
      <TabsContent value="main-section">
        <MainSectionForm />
      </TabsContent>
      <TabsContent value="about-section">
        <AboutSectionForm />
      </TabsContent>
      <TabsContent value="plans-section">
        <PlanSectionsForm />
      </TabsContent>
    </>
  );
}

export default AdminDashboardTabsContent;
