"use client";

import InfoSection from "@/app/components/about/info-section";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { InfoSectionContent } from "@/schemas/baseSchema";
import React, { useRef } from "react";

function Info({ infoItemsSection }: { infoItemsSection: InfoSectionContent }) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();
  return (
    <section
      ref={sectionRef}
      id="info"
      aria-label="info-content"
      aria-labelledby="info-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-center relative bg-[var(--color-box2)] `}
    >
      <InfoSection
        title={infoItemsSection.title}
        description={infoItemsSection.description}
        infoItems={infoItemsSection.infoItems}
      />
    </section>
  );
}

export default Info;
