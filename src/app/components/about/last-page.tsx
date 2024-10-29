"use client";

import GlueInternational from "@/app/components/about/glue-international";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";
import ScrollUp from "@/app/components/scroll-up";
import { useScroll } from "@/app/hooks/useScroll";
import {
  GlueInternationalContent,
  SponsorsSectionContent,
} from "@/utils/about-types";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { NAVBAR_HEIGHT } from "@/constants";

type Props = {
  glueInternationalSection: GlueInternationalContent;
  sponsorsSection: SponsorsSectionContent;
};

function LastPage({ glueInternationalSection, sponsorsSection }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  return (
    <section
      ref={sectionRef}
      id="last"
      aria-label="last-page-content"
      aria-labelledby="last-page-heading"
      className={`h-screen pt-[${NAVBAR_HEIGHT}rem] bg-uiwhite snap-start relative`}
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 space-y-4 mx-auto container h-full flex flex-col justify-between relative"
      >
        <GlueInternational glueInternational={glueInternationalSection} />
        <SponsorsCarousel
          sponsors={sponsorsSection.sponsors}
          title={sponsorsSection.title}
          description={sponsorsSection.description}
        />
        <ScrollUp color="uiblack" href="#main" />
      </motion.article>
    </section>
  );
}

export default LastPage;
