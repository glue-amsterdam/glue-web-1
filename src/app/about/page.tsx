import { Metadata } from "next";
import { Suspense } from "react";
import Background from "@/app/components/background";
import AboutPageContainer from "@/app/about/about-page-container";

export const metadata: Metadata = {
  title: "GLUE - About",
};

export default function AboutPage({}) {
  return (
    <div className="fixed inset-0 overflow-x-hidden overflow-y-scroll snap-y snap-mandatory">
      <Suspense>
        <main className="relative z-10">
          <AboutPageContainer />
        </main>
      </Suspense>
      <Background />
    </div>
  );
}
