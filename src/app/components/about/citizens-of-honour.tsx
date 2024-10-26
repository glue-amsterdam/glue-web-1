"use client";

import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { CitizensSectionContent } from "@/utils/about-types";
import { useRef } from "react";

interface CitizenOfHonourContentProps {
  citizensSection: CitizensSectionContent;
}
function CitizenOfHonour({ citizensSection }: CitizenOfHonourContentProps) {
  const colors = useColors();
  const { box3: box3Color } = colors;

  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="citizens"
      aria-label="citizens-content"
      aria-labelledby="citizens-heading"
      style={{ backgroundColor: box3Color }}
      className="h-screen pt-[5rem] mx-auto relative snap-center"
    >
      <div className="citizens-bg bg-uiwhite" />

      <CitizenOfHonourSection
        citizens={citizensSection.citizens}
        description={citizensSection.description}
        title={citizensSection.title}
      />
    </section>
  );
}

export default CitizenOfHonour;
