"use client";
import React, { useRef, Suspense } from "react";
import { useColors } from "../context/MainContext";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useSetPageDataset } from "@/hooks/useSetPageDataset";
import { CarouselClientType } from "@/schemas/carouselSchema";
import ReactLenis from "@studio-freight/react-lenis";
import { aboutAnimations } from "@/lib/animations/about-animations";
import MainSection from "@/components/about/main-section/MainSection";
import ParticipantSection from "@/components/about/participant-section/ParticipantSection";
import { ParticipantsResponse } from "@/schemas/participantsSchema";
import CofHonourSection from "@/components/about/citizens-of-honour-section/CofHonourSection";
import { ClientCitizensSection } from "@/schemas/citizenSchema";
import CuratedStickySection from "@/components/about/curated-sticky-section/CuratedStickySection";
import { CuratedV2Response } from "@/lib/about/fetch-curated-section-v2";
import InfoSection from "@/components/about/info-section/InfoSection";
import { InfoSectionClient } from "@/schemas/infoSchema";
import PressSection from "@/components/about/press-section/PressSection";
import { PressItemsSectionContent } from "@/schemas/pressSchema";
import { GlueInternationalContent } from "@/schemas/internationalSchema";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import LastPageSection from "@/components/about/last-page/LastPageSection";
import NavBar from "@/components/NavBar";

export default function AboutClientPage({
  carouselData,
  participantsData,
  citizensData,
  curatedData,
  infoSection,
  pressSectionData,
  glueInternational,
  sponsorsData,
}: {
  carouselData: CarouselClientType;
  participantsData: ParticipantsResponse;
  citizensData: ClientCitizensSection;
  curatedData: CuratedV2Response;
  infoSection: InfoSectionClient;
  pressSectionData: PressItemsSectionContent;
  glueInternational: GlueInternationalContent;
  sponsorsData: SponsorsSection;
}) {
  useSetPageDataset("downButton");

  const container = useRef<HTMLDivElement>(null);
  const mainColors = useColors();
  const g_letterRef = useRef<SVGSVGElement>(null);
  const l_letterRef = useRef<SVGSVGElement>(null);
  const u_letterRef = useRef<SVGSVGElement>(null);
  const e_letterRef = useRef<SVGSVGElement>(null);
  const gl_line = useRef<SVGPathElement>(null);
  const lu_line = useRef<SVGPathElement>(null);
  const ue_line = useRef<SVGPathElement>(null);
  const eg_line = useRef<SVGPathElement>(null);
  const topNavBarRef = useRef<HTMLDivElement>(null);
  const sectionRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descriptionRef = useRef<HTMLParagraphElement>(null);
  const imageSliderRef = useRef<HTMLDivElement>(null);

  // Add safety checks for data
  const isDataLoaded =
    carouselData &&
    participantsData &&
    citizensData &&
    curatedData &&
    infoSection &&
    pressSectionData &&
    glueInternational &&
    sponsorsData;

  useGSAP(
    () => {
      // Only run animations if data is loaded
      if (!isDataLoaded) return;

      // Add a small delay to ensure all refs are properly mounted
      const timeoutId = setTimeout(() => {
        try {
          const tl = gsap.timeline();
          aboutAnimations({
            refs: {
              g_letterRef,
              gl_line,
              l_letterRef,
              lu_line,
              u_letterRef,
              ue_line,
              e_letterRef,
              eg_line,
              topNavBarRef,
              sectionRef,
              titleRef,
              descriptionRef,
              imageSliderRef,
            },
            tl,
          });
        } catch (error) {
          console.error("GSAP animation error:", error);
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    },
    { scope: container }
  );

  // Show loading state if data is not loaded
  if (!isDataLoaded) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ReactLenis root>
      <main
        className="min-h-dvh h-full"
        style={{ backgroundColor: mainColors?.box4 }}
        ref={container}
      >
        <NavBar ref={topNavBarRef} />

        <MainSection
          descriptionRef={descriptionRef}
          imageSliderRef={imageSliderRef}
          titleRef={titleRef}
          bgColor={mainColors?.box4}
          carouselData={carouselData}
          sectionRef={sectionRef}
        />
        <ParticipantSection participantsData={participantsData} />
        <Suspense fallback={<div>Loading...</div>}>
          <CofHonourSection citizensData={citizensData} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <CuratedStickySection
            headerData={curatedData.headerData}
            curatedGroups={curatedData.curatedGroups}
          />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <InfoSection infoSection={infoSection} />
        </Suspense>
        <Suspense fallback={<div>Loading...</div>}>
          <PressSection pressItemsSection={pressSectionData} />
        </Suspense>
        <LastPageSection
          glueInternational={glueInternational}
          sponsorsData={sponsorsData}
        />
      </main>
    </ReactLenis>
  );
}
