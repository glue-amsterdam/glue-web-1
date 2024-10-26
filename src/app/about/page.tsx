import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutPageContainer from "@/app/about/about-page-container";

export default function AboutPage({}) {
  return (
    <>
      <Suspense>
        <AboutPageContainer />
      </Suspense>
      <Background />
    </>
  );
}
