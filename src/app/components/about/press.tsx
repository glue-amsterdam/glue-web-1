"use client";

import PressSection from "@/app/components/about/press-section";
import GlueConectedImage from "@/app/components/glue-connected-image";
import { useScroll } from "@/app/hooks/useScroll";
import { NAVBAR_HEIGHT } from "@/constants";
import { PressItemsSectionContent } from "@/schemas/pressSchema";
import React, { useRef } from "react";

type Props = {
  pressItemsSection: PressItemsSectionContent;
};

function Press({ pressItemsSection }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="press"
      aria-label="press-content"
      aria-labelledby="press-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh snap-start relative bg-[var(--color-box2)] `}
    >
      <PressSection
        pressItems={pressItemsSection.pressItems}
        title={pressItemsSection.title}
        description={pressItemsSection.description}
      />
      <PressBackground />
    </section>
  );
}

function PressBackground() {
  return (
    <>
      <div className="press-bg rotate-180 bg-uiwhite" />
      <GlueConectedImage
        width={250}
        height={100}
        className="absolute bottom-0 right-0 opacity-20 md:opacity-50"
      />
    </>
  );
}

export default Press;
