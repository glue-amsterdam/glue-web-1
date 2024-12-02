import { fetchAbout, fetchSponsors } from "@/utils/api";
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
