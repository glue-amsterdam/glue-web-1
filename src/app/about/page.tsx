import BackgroundGrid from "../components/background-grid";
import MainSectionSuspense from "../components/about/main-section-suspense";
import ParticipantsSectionSuspense from "../components/about/participants-section-suspense";
import CitizenOfHonourSuspense from "../components/about/citizen-of-honour-suspense";
/* import ParticipantsSection from "./participants-section";
import CitizenOfHonourSection from "./citizen-of-honour-section";
import CuratedMembersSection from "./curated-members-section";
import InfoSection from "./info-section";
import PressSection from "./press-section";
import SponsorsCarousel from "./sponsors-carousel";
import GlueInternational from "./glue-international";
; */

function AboutPage({}) {
  return (
    <div className="fixed inset-0 flex justify-center overflow-y-scroll bg-black">
      <main
        className={`container delayed-appearance min-h-[70vh] mt-[15vh] p-4 xl:max-w-[1400px] rounded-xl bg-gray/5 shadow-lg absolute z-10`}
      >
        <MainSectionSuspense />
        <ParticipantsSectionSuspense />
        <CitizenOfHonourSuspense />
      </main>
      <BackgroundGrid />
    </div>
  );
}

export default AboutPage;
