import BackgroundGrid from "../components/background-grid";
import MainSectionSuspense from "../components/about/main-section/main-section-suspense";
import ParticipantsSectionSuspense from "../components/about/participants-section/participants-section-suspense";
import CitizenOfHonourSuspense from "../components/about/citizen/citizen-of-honour-suspense";
import CuratedMembersSuspense from "../components/about/curated/curated-members-suspense";
import InfoSectionSuspense from "../components/about/info-section/info-section-suspense";
import PressSectionSuspense from "../components/about/press-section/press-section-suspense";
import { Metadata } from "next";
import { fetchMainColors } from "@/utils/api";
import Image from "next/image";
import LogoMain from "../components/home-page/logo-main";
import LastPageSuspense from "../components/about/last-page-suspense";

export const metadata: Metadata = {
  title: "GLUE - About",
};

async function AboutPage({}) {
  const colors = await fetchMainColors();

  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-scroll snap-y snap-mandatory">
      <main className="relative z-10">
        <div className="h-screen snap-start">
          <MainSectionSuspense />
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
            <ParticipantsSectionSuspense />
          </div>
          <div
            style={{ backgroundColor: colors.box3 }}
            className="h-screen snap-start relative"
          >
            <div className="citizens-bg bg-uiwhite" />

            <CitizenOfHonourSuspense />
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
              <CuratedMembersSuspense />
            </div>
          </div>
          <div
            style={{ backgroundColor: colors.box2 }}
            className="h-screen snap-start"
          >
            <InfoSectionSuspense />
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

            <PressSectionSuspense />
          </div>
          <div className="h-screen snap-start bg-uiwhite">
            <section className="section-container">
              <div className="screen-size">
                <LastPageSuspense />
              </div>
            </section>
          </div>
        </div>
      </main>
      <Background />
    </div>
  );
}

function Background() {
  return (
    <div className="fixed inset-0">
      <LogoMain />
      <BackgroundGrid />
    </div>
  );
}

export default AboutPage;
