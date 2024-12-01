import { fetchAbout, fetchSponsors } from "@/utils/api";
import CitizenOfHonour from "@/app/components/about/citizens-of-honour";
import Press from "@/app/components/about/press";
import LastPage from "@/app/components/about/last-page";
import { Suspense } from "react";
import {
  GlueInternationalContent,
  SponsorsSectionContent,
} from "@/schemas/baseSchema";

async function AboutPageContainer() {
  const aboutData = await fetchAbout();

  return (
    <>
      <CitizenOfHonour citizensSection={aboutData.citizensSection} />

      <Press pressItemsSection={aboutData.pressItemsSection} />
      <Suspense>
        <SponsorsPageSection
          headerData={aboutData.sponsorsSection}
          glueInternationalSection={aboutData.glueInternationalSection}
        />
      </Suspense>
    </>
  );
}

export default AboutPageContainer;

async function SponsorsPageSection({
  headerData,
  glueInternationalSection,
}: {
  headerData: SponsorsSectionContent;
  glueInternationalSection: GlueInternationalContent;
}) {
  const sponsors = await fetchSponsors();

  return (
    <LastPage
      glueInternationalSection={glueInternationalSection}
      headerData={headerData}
      sponsors={sponsors}
    />
  );
}
