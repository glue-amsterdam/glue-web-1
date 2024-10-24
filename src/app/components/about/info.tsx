"use client";

import InfoSection from "@/app/components/about/info-section";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { InfoSectionContent } from "@/utils/about-types";
import React, { useRef } from "react";

type Props = {
  infoItemsSection: InfoSectionContent;
};

function Info({ infoItemsSection }: Props) {
  const colors = useColors();
  const { box2: box2Color } = colors;

  const sectionRef = useRef<HTMLElement>(null);
  useScroll({ id: "info", idRef: sectionRef });
  return (
    <section
      ref={sectionRef}
      id="info"
      aria-label="info-content"
      aria-labelledby="info-heading"
      style={{ backgroundColor: box2Color }}
      className="h-screen pt-[5rem] snap-center relative"
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
