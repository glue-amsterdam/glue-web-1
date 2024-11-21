"use client";

import InfoSection from "@/app/components/about/info-section";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { InfoSectionContent } from "@/schemas/baseSchema";
import React, { useRef } from "react";

type Props = {
  infoItemsSection: InfoSectionContent;
};

function Info({ infoItemsSection }: Props) {
  const colors = useColors();
  const { box2: box2Color } = colors;

  const sectionRef = useRef<HTMLElement>(null);
  useScroll();
  return (
    <section
      ref={sectionRef}
      id="info"
      aria-label="info-content"
      aria-labelledby="info-heading"
      style={{ backgroundColor: box2Color, paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-center relative`}
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
