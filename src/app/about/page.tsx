import BackgroundGrid from "../components/background-grid";
import MainSectionSuspense from "../components/about/main-section/main-section-suspense";
import ParticipantsSectionSuspense from "../components/about/participants-section/participants-section-suspense";
import CitizenOfHonourSuspense from "../components/about/citizen/citizen-of-honour-suspense";
import CuratedMembersSuspense from "../components/about/curated/curated-members-suspense";
import InfoSectionSuspense from "../components/about/info-section/info-section-suspense";
import PressSectionSuspense from "../components/about/press-section/press-section-suspense";
import SponsorsCarouselSuspense from "../components/about/sponsors-carousel/sponsors-carousel-suspense";
import GlueInternationalSuspense from "../components/about/glue-international/glue-international-suspense";

function AboutPage({}) {
  return (
    <div className="fixed inset-0 flex justify-center overflow-y-scroll bg-black">
      <main
        className={`container delayed-appearance min-h-[70vh] mt-[15vh] p-4 xl:max-w-[1400px] rounded-xl bg-gray/5 shadow-lg absolute z-10`}
      >
        <MainSectionSuspense />
        <ParticipantsSectionSuspense />
        <CitizenOfHonourSuspense />
        <CuratedMembersSuspense />
        <InfoSectionSuspense />
        <PressSectionSuspense />
        <SponsorsCarouselSuspense />
        <GlueInternationalSuspense />
      </main>
      <BackgroundGrid />
    </div>
  );
}

export default AboutPage;
