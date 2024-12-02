import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutCarousel from "@/app/about/about-carousel";
import AboutParticipants from "@/app/about/about-participants";
import AboutCurated from "@/app/about/about-curated";
import AboutInfo from "@/app/about/about-info";
import AboutCitizens from "@/app/about/about-citizens";
import { CarouselSkeleton } from "@/app/about/components/skeletons/carouselSkeleton";
import { ParticipantsSkeleton } from "@/app/about/components/skeletons/participantSkeleton";
import { CuratedSkeleton } from "@/app/about/components/skeletons/curatedSkeleton";
import { InfoSectionSkeleton } from "@/app/about/components/skeletons/infoSkeleton";
import { CitizensSkeleton } from "@/app/about/components/skeletons/citizenSkeleton";

export default function AboutPage({}) {
  return (
    <>
      <Suspense fallback={<CarouselSkeleton />}>
        <AboutCarousel />
      </Suspense>
      <Suspense fallback={<ParticipantsSkeleton />}>
        <AboutParticipants />
      </Suspense>
      <Suspense fallback={<CitizensSkeleton />}>
        <AboutCitizens />
      </Suspense>
      <Suspense fallback={<CuratedSkeleton />}>
        <AboutCurated />
      </Suspense>
      <Suspense fallback={<InfoSectionSkeleton />}>
        <AboutInfo />
      </Suspense>

      <Background />
    </>
  );
}
