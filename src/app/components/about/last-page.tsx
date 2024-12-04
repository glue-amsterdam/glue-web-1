"use client";

import GlueInternational from "@/app/components/about/glue-international";
import ScrollUp from "@/app/components/scroll-up";
import { useScroll } from "@/app/hooks/useScroll";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { NAVBAR_HEIGHT } from "@/constants";

import { GlueInternationalContent } from "@/schemas/internationalSchema";
import { SponsorsSection } from "@/schemas/sponsorsSchema";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";

type Props = {
  glueInternational: GlueInternationalContent;
  sponsorsData: SponsorsSection;
};

function LastPage({ glueInternational, sponsorsData }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="last"
      aria-label="last-page-content"
      aria-labelledby="last-page-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh bg-[var(--color-triangle)] snap-start relative overflow-y-hidden`}
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 space-y-4 mx-auto container h-full flex flex-col relative"
      >
        <GlueInternational glueInternational={glueInternational} />
        <SponsorsCarousel sponsorsData={sponsorsData} />
        <ScrollUp color="uiblack" href="#main" />
      </motion.article>
    </section>
  );
}

export default LastPage;
