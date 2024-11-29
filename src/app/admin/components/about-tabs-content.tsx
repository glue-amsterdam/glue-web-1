import CitizensForm from "@/app/admin/forms/citizens-form";
import CuratedMembersForm from "@/app/admin/forms/curated-members-form";
import InfoItemsForm from "@/app/admin/forms/info-items-form";
import InternationalForm from "@/app/admin/forms/international-form";
import ParticipantsForm from "@/app/admin/forms/participants-section-form";
import PressItemsForm from "@/app/admin/forms/press-items-form";
import SponsorsForm from "@/app/admin/forms/sponsors-form";
import AboutCarouselSection from "@/app/admin/sections/about-carousel-section";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { TabsContent } from "@/components/ui/tabs";
import React, { Suspense } from "react";

function AboutTabsContent() {
  return (
    <div className="mt-4">
      <TabsContent value="carousel">
        <Suspense fallback={<LoadingSpinner />}>
          <AboutCarouselSection />
        </Suspense>
      </TabsContent>
      <TabsContent value="participants">
        <ParticipantsForm />
      </TabsContent>
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
      <TabsContent value="international">
        <InternationalForm />
      </TabsContent>
      <TabsContent value="sponsors">
        <SponsorsForm />
      </TabsContent>
    </div>
  );
}

export default AboutTabsContent;
