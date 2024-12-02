import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutCarousel from "@/app/about/about-carousel";
import AboutParticipants from "@/app/about/about-participants";
import CenteredLoader from "@/app/components/centered-loader";
import AboutCurated from "@/app/about/about-curated";
import AboutInfo from "@/app/about/about-info";
import AboutCitizens from "@/app/about/about-citizens";
import { CarouselSkeleton } from "@/app/about/components/skeletons";

export default function AboutPage({}) {
  return (
    <>
      <Suspense fallback={<CarouselSkeleton />}>
        <AboutCarousel />
      </Suspense>
      <Suspense fallback={<CenteredLoader />}>
        <AboutParticipants />
      </Suspense>
      <Suspense fallback={<CenteredLoader />}>
        <AboutCitizens />
      </Suspense>
      <Suspense fallback={<CenteredLoader />}>
        <AboutCurated />
      </Suspense>
      <Suspense fallback={<CenteredLoader />}>
        <AboutInfo />
      </Suspense>

      <Background />
    </>
  );
}
