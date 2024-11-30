import { fetchAbout, fetchCurated, fetchSponsors } from "@/utils/api";
import CitizenOfHonour from "@/app/components/about/citizens-of-honour";
import CuratedMembers from "@/app/components/about/curated-participants";
import Info from "@/app/components/about/info";
import Press from "@/app/components/about/press";
import LastPage from "@/app/components/about/last-page";
import { Suspense } from "react";
import {
  CuratedMemberSectionContent,
  GlueInternationalContent,
  SponsorsSectionContent,
} from "@/schemas/baseSchema";

async function AboutPageContainer() {
  const aboutData = await fetchAbout();

  return (
    <>
      <CitizenOfHonour citizensSection={aboutData.citizensSection} />
      <Suspense>
        <CuratedSection headerData={aboutData.curatedMembersSection} />
      </Suspense>
      <Info infoItemsSection={aboutData.infoItemsSection} />
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

async function CuratedSection({
  headerData,
}: {
  headerData: CuratedMemberSectionContent;
}) {
  const curatedParticipants = await fetchCurated();

  return (
    <CuratedMembers
      headerData={headerData}
      curatedParticipants={curatedParticipants}
    />
  );
}
