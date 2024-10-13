import BackgroundGrid from "../components/background-grid";
import MainSectionSuspense from "../components/about/main-section/main-section-suspense";
import ParticipantsSectionSuspense from "../components/about/participants-section/participants-section-suspense";
import CitizenOfHonourSuspense from "../components/about/citizen/citizen-of-honour-suspense";
import CuratedMembersSuspense from "../components/about/curated/curated-members-suspense";
import InfoSectionSuspense from "../components/about/info-section/info-section-suspense";
import PressSectionSuspense from "../components/about/press-section/press-section-suspense";
import SponsorsCarouselSuspense from "../components/about/sponsors-carousel/sponsors-carousel-suspense";
import GlueInternationalSuspense from "../components/about/glue-international/glue-international-suspense";
import { Metadata } from "next";
import { fetchMainColors } from "@/utils/api";
import Image from "next/image";
import LogoMain from "../components/home-page/logo-main";

export const metadata: Metadata = {
  title: "GLUE - About",
};

async function AboutPage({}) {
  const colors = await fetchMainColors();

  return (
    <div className="fixed inset-0 overflow-y-scroll snap-y snap-mandatory">
      <main className="relative z-10">
        <div className="h-screen snap-start">
          <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
            <MainSectionSuspense />
          </div>
          <div className={`h-screen relative snap-start bg-uiwhite`}>
            <div className="absolute  z-10 bottom-20 right-10">
              <div className="relative size-40 lg:size-52">
                <Image
                  src={"/logos/logo-main.png"}
                  className="invert opacity-30"
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
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <ParticipantsSectionSuspense />
            </div>
          </div>
          <div
            style={{ backgroundColor: colors.box3 }}
            className="h-screen snap-start relative"
          >
            <div className="citizens-bg bg-uiwhite" />

            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <CitizenOfHonourSuspense />
            </div>
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
            <div className="absolute z-10 right-20 top-10 rotate-[-40deg]">
              <div className="relative size-80">
                <Image
                  src={"/logos/logo-main.png"}
                  className="opacity-20 md:opacity-50"
                  alt="GLUE logo, connected by design"
                  fill
                />
              </div>
            </div>
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <CuratedMembersSuspense />
            </div>
          </div>
          <div
            style={{ backgroundColor: colors.box2 }}
            className="h-screen snap-start"
          >
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <InfoSectionSuspense />
            </div>
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
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <PressSectionSuspense />
            </div>
          </div>
          <div className="h-screen snap-start bg-uiwhite">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <div>
                <GlueInternationalSuspense />
                <SponsorsCarouselSuspense />
              </div>
            </div>
          </div>
        </div>
      </main>
      <div className="fixed inset-0">
        <LogoMain />
        <BackgroundGrid />
      </div>
    </div>
  );
}

export default AboutPage;
