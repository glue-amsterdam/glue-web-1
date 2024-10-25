"use client";

import PressSection from "@/app/components/about/press-section";
import GlueConectedImage from "@/app/components/glue-connected-image";
import { useColors } from "@/app/context/MainContext";
import { useScroll } from "@/app/hooks/useScroll";
import { PressItemsSectionContent } from "@/utils/about-types";
import React, { useRef } from "react";

type Props = {
  pressItemsSection: PressItemsSectionContent;
};

function Press({ pressItemsSection }: Props) {
  const colors = useColors();
  const { box2: box2Color } = colors;

  const sectionRef = useRef<HTMLElement>(null);
  useScroll({ id: "press", idRef: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="press"
      aria-label="press-content"
      aria-labelledby="press-heading"
      style={{ backgroundColor: box2Color }}
      className="h-screen pt-[5rem] snap-start relative"
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
