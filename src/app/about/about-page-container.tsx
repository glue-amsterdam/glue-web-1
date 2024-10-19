import { fetchAbout, fetchMainColors } from "@/utils/api";
import Image from "next/image";
import MainSection from "@/app/components/about/main-section";
import ParticipantsSection from "@/app/components/about/participants-section";
import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import CuratedMembersSection from "@/app/components/about/curated-members-section";
import InfoSection from "@/app/components/about/info-section";
import PressSection from "@/app/components/about/press-section";
import GlueInternational from "@/app/components/about/glue-international";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";

async function AboutPageContainer() {
  const colors = await fetchMainColors();
  const aboutData = await fetchAbout();
  return (
    <div className="h-screen snap-start">
      <MainSection content={aboutData.mainSection} />
      <div className="h-screen relative snap-start bg-uiwhite">
        <div className="absolute z-10 bottom-0 md:bottom-20 right-0 md:right-10">
          <div className="relative size-32 md:size-40 lg:size-52">
            <Image
              src={"/logos/logo-main.png"}
              className="invert opacity-10 md:opacity-30"
              alt="GLUE logo, connected by design"
              fill
            />
          </div>
        </div>
        <div className="absolute inset-0 grid grid-cols-2">
          <div className="relative">
            <div
              style={{ background: colors.box1 }}
              className={`participants-bg`}
            />
          </div>
          <div className="relative">
            <div
              style={{ background: colors.box2 }}
              className="participants-bg-r"
            />
          </div>
        </div>
        <ParticipantsSection participants={aboutData.participants} />
      </div>
      <div
        style={{ backgroundColor: colors.box3 }}
        className="h-screen snap-start relative"
      >
        <div className="citizens-bg bg-uiwhite" />

        <CitizenOfHonourSection initialCitizens={aboutData.citizens} />
      </div>
      <div
        style={{ backgroundColor: colors.box3 }}
        className="h-screen snap-start relative"
      >
        <Image
          src={"/logos/connected.png"}
          className="absolute bottom-0 invert opacity-20 md:opacity-50"
          alt="GLUE logo, connected by design"
          width={250}
          height={100}
        />
        <div className="absolute right-20 top-10 rotate-[-40deg]">
          <div className="relative size-80">
            <Image
              src={"/logos/logo-main.png"}
              className="opacity-20 md:opacity-50"
              alt="GLUE logo, connected by design"
              fill
            />
          </div>
        </div>
        <div className="z-10">
          <CuratedMembersSection curatedMembers={aboutData.curatedMembers} />
        </div>
      </div>
      <div
        style={{ backgroundColor: colors.box2 }}
        className="h-screen snap-start"
      >
        <InfoSection infoItems={aboutData.infoItems} />
      </div>
      <div
        style={{ backgroundColor: colors.box2 }}
        className="h-screen snap-start relative "
      >
        <div className="press-bg rotate-180 bg-uiwhite" />
        <Image
          src={"/logos/connected.png"}
          className="absolute bottom-0 right-0 opacity-20 md:opacity-50"
          alt="GLUE logo, connected by design"
          width={250}
          height={100}
        />

        <PressSection pressItems={aboutData.pressItems} />
      </div>
      <div className="h-screen snap-start bg-uiwhite">
        <section className="section-container">
          <div className="screen-size">
            <div className="flex flex-col justify-around h-full">
              <GlueInternational content={aboutData.glueInternational} />
              <SponsorsCarousel sponsors={aboutData.sponsors} />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPageContainer;
