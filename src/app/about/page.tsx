import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutPageContainer from "@/app/about/about-page-container";

export default function AboutPage({}) {
  return (
    <main className="h-screen overflow-y-scroll snap-y snap-mandatory scroll-smooth">
      <Suspense>
        <AboutPageContainer />
      </Suspense>
      <Background />
    </main>
  );
}
