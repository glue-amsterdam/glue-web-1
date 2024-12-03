"use client";

import CitizenOfHonourSection from "@/app/components/about/citizens-of-honour-section";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { CitizensSection } from "@/schemas/citizenSchema";
import { useRef } from "react";

interface CitizenOfHonourContentProps {
  citizensSection: CitizensSection;
}
function CitizenOfHonour({ citizensSection }: CitizenOfHonourContentProps) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="citizens"
      aria-label="citizens-content"
      aria-labelledby="citizens-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh bg-[var(--color-box3)]  mx-auto relative snap-center`}
    >
      <CitizenOfHonourSection
        citizensByYear={citizensSection.citizensByYear}
        description={citizensSection.description}
        title={citizensSection.title}
      />
    </section>
  );
}

export default CitizenOfHonour;
