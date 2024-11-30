import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutCarousel from "@/app/about/about-carousel";

export default function AboutPage({}) {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <AboutCarousel />
      </Suspense>
      {/* <Suspense>
        <AboutPageContainer />
      </Suspense> */}
      <Background />
    </>
  );
}
