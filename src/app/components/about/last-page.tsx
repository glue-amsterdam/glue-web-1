"use client";

import GlueInternational from "@/app/components/about/glue-international";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";
import ScrollUp from "@/app/components/scroll-up";
import { useScroll } from "@/app/hooks/useScroll";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { NAVBAR_HEIGHT } from "@/constants";
import { Sponsor } from "@/utils/sponsors-types";
import {
  GlueInternationalContent,
  SponsorsSectionContent,
} from "@/schemas/baseSchema";

type Props = {
  glueInternationalSection: GlueInternationalContent;
  headerData: SponsorsSectionContent;
  sponsors: Sponsor[];
};

function LastPage({ glueInternationalSection, headerData, sponsors }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="last"
      aria-label="last-page-content"
      aria-labelledby="last-page-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className={`h-dvh bg-uiwhite snap-start relative`}
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 space-y-4 mx-auto container h-full flex flex-col justify-between relative"
      >
        <GlueInternational glueInternational={glueInternationalSection} />
        <SponsorsCarousel
          sponsors={sponsors}
          title={headerData.title}
          description={headerData.description}
        />
        <ScrollUp color="uiblack" href="#main" />
      </motion.article>
    </section>
  );
}

export default LastPage;
