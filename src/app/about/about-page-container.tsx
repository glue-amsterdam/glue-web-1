import { fetchAbout, fetchMainColors } from "@/utils/api";
import MainSection from "@/app/components/about/main-section";
import Participants from "@/app/components/about/participants";
import CitizenOfHonour from "@/app/components/about/citizens-of-honour";
import CuratedMembers from "@/app/components/about/curated-members";
import Info from "@/app/components/about/info";
import Press from "@/app/components/about/press";
import LastPage from "@/app/components/about/last-page";

async function AboutPageContainer() {
  const colors = await fetchMainColors();
  const aboutData = await fetchAbout();

  const { box1: box1Color, box2: box2Color, box3: box3Color } = colors;

  return (
    <div className="h-screen snap-start">
      <MainSection content={aboutData.mainSection} />
      <Participants
        box1Color={box1Color}
        box2Color={box2Color}
        participants={aboutData.participants}
      />
      <CitizenOfHonour
        initialCitizens={aboutData.citizens}
        box3Color={box3Color}
      />
      <CuratedMembers
        curatedMembers={aboutData.curatedMembers}
        box3Color={box3Color}
      />
      <Info box2Color={box2Color} infoItems={aboutData.infoItems} />
      <Press box2Color={box2Color} pressItems={aboutData.pressItems} />
      <LastPage
        glueInternational={aboutData.glueInternational}
        sponsors={aboutData.sponsors}
      />
    </div>
  );
}

export default AboutPageContainer;
