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
          <div className="h-screen relative snap-start bg-black/80">
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
          <div className="h-screen snap-start bg-[#2e41ad]">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <CitizenOfHonourSuspense />
            </div>
          </div>
          <div className="h-screen snap-start bg-[#bd6a26]">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <CuratedMembersSuspense />
            </div>
          </div>
          <div className="h-screen snap-start bg-[#982ea7]">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <InfoSectionSuspense />
            </div>
          </div>
          <div className="h-screen snap-start bg-[#2de02d]">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <PressSectionSuspense />
            </div>
          </div>
          <div className="h-screen snap-start bg-[#f00]">
            <div className="container xl:max-w-[1400px] mx-auto h-full flex-center">
              <SponsorsCarouselSuspense />
              <GlueInternationalSuspense />
            </div>
          </div>
        </div>
      </main>
      <div className="fixed inset-0">
        <BackgroundGrid />
      </div>
    </div>
  );
}

export default AboutPage;
