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
import { ErrorBoundary } from "react-error-boundary";
import ErrorFallback from "@/app/components/error-fallback";

export default function AboutPage() {
  return (
    <>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Suspense fallback={<CarouselSkeleton />}>
          <AboutCarousel />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div>Error loading participants. Please try again later.</div>
        }
      >
        <Suspense fallback={<ParticipantsSkeleton />}>
          <AboutParticipants />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div>Error loading citizens of honor. Please try again later.</div>
        }
      >
        <Suspense fallback={<CitizensSkeleton />}>
          <AboutCitizens />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div>Error loading curated section. Please try again later.</div>
        }
      >
        <Suspense fallback={<CuratedSkeleton />}>
          <AboutCurated />
        </Suspense>
      </ErrorBoundary>

      <ErrorBoundary
        fallback={
          <div>Error loading info section. Please try again later.</div>
        }
      >
        <Suspense fallback={<InfoSectionSkeleton />}>
          <AboutInfo />
        </Suspense>
      </ErrorBoundary>
      <Background />
    </>
  );
}
