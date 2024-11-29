import MainSectionPage from "@/app/admin/main-section-page";
import AboutSectionForm from "@/app/admin/forms/about-section-form";
import PlanSectionsForm from "@/app/admin/forms/plans-section-form";
import CenteredLoader from "@/app/components/centered-loader";
import { TabsContent } from "@/components/ui/tabs";
import React, { Suspense } from "react";

function AdminDashboardTabsContent() {
  return (
    <>
      <TabsContent value="main-section">
        <MainSectionPage />
      </TabsContent>
      <TabsContent value="about-section">
        <AboutSectionForm />
      </TabsContent>
      <TabsContent value="plans-section">
        <Suspense fallback={<CenteredLoader />}>
          <PlanSectionsForm />
        </Suspense>
      </TabsContent>
    </>
  );
}

export default AdminDashboardTabsContent;
