import {
  fetchAbout,
  fetchAllParticipants,
  fetchCurated,
  fetchSponsors,
} from "@/utils/api";
import Participants from "@/app/components/about/participants";
import CitizenOfHonour from "@/app/components/about/citizens-of-honour";
import CuratedMembers from "@/app/components/about/curated-participants";
import Info from "@/app/components/about/info";
import Press from "@/app/components/about/press";
import LastPage from "@/app/components/about/last-page";
import { Suspense } from "react";
import {
  CuratedMemberSectionContent,
  GlueInternationalContent,
  ParticipantsSectionContent,
  SponsorsSectionContent,
} from "@/schemas/baseSchema";
import CarouselSection from "@/app/components/about/carousel-section";

async function AboutPageContainer() {
  const aboutData = await fetchAbout();

  return (
    <>
      <CarouselSection mainSection={aboutData.carouselSection} />
      <Suspense>
        <ParticipantsPageSection headerData={aboutData.participantsSection} />
      </Suspense>
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

async function ParticipantsPageSection({
  headerData,
}: {
  headerData: ParticipantsSectionContent;
}) {
  const participantsData = await fetchAllParticipants();
  const participantsSection = participantsData.slice(0, 15);

  return (
    <Participants participants={participantsSection} headerData={headerData} />
  );
}

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
