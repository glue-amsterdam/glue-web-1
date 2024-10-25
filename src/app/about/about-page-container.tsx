import { fetchAbout } from "@/utils/api";
import MainSection from "@/app/components/about/main-section";
import Participants from "@/app/components/about/participants";
import CitizenOfHonour from "@/app/components/about/citizens-of-honour";
import CuratedMembers from "@/app/components/about/curated-members";
import Info from "@/app/components/about/info";
import Press from "@/app/components/about/press";
import LastPage from "@/app/components/about/last-page";

async function AboutPageContainer() {
  const aboutData = await fetchAbout();

  return (
    <>
      <MainSection mainSection={aboutData.carouselSection} />
      <Participants participantsSection={aboutData.participantsSection} />
      <CitizenOfHonour citizensSection={aboutData.citizensSection} />
      <CuratedMembers curatedMembersSection={aboutData.curatedMembersSection} />
      <Info infoItemsSection={aboutData.infoItemsSection} />
      <Press pressItemsSection={aboutData.pressItemsSection} />
      <LastPage
        glueInternationalSection={aboutData.glueInternationalSection}
        sponsorsSection={aboutData.sponsorsSection}
      />
    </>
  );
}

export default AboutPageContainer;
