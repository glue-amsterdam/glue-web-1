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
    <div className="h-screen snap-start">
      <MainSection content={aboutData.mainSection} />
      <Participants participants={aboutData.participants} />
      <CitizenOfHonour initialCitizens={aboutData.citizens} />
      <CuratedMembers curatedMembers={aboutData.curatedMembers} />
      <Info infoItems={aboutData.infoItems} />
      <Press pressItems={aboutData.pressItems} />
      <LastPage
        glueInternational={aboutData.glueInternational}
        sponsors={aboutData.sponsors}
      />
    </div>
  );
}

export default AboutPageContainer;
