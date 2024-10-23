import { Metadata } from "next";
import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutPageContainer from "@/app/about/about-page-container";

export const metadata: Metadata = {
  title: "GLUE - About",
};

export default function AboutPage({}) {
  return (
    <>
      <main className="flex-grow overflow-y-auto snap-y snap-mandatory overflow-x-hidden">
        <Suspense>
          <AboutPageContainer />`
        </Suspense>
      </main>
      <Background />
    </>
  );
}
