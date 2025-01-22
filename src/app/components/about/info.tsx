"use client";

import InfoSection from "@/app/components/about/info-section";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { InfoSectionClient } from "@/schemas/infoSchema";
import React, { useRef } from "react";

function Info({ infoItemsSection }: { infoItemsSection: InfoSectionClient }) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  if (!infoItemsSection.is_visible) {
    return null;
  }
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
