"use client";

import GlueInternational from "@/app/components/about/glue-international";
import ScrollUp from "@/app/components/scroll-up";
import { useScroll } from "@/app/hooks/useScroll";
import React, { useRef } from "react";
import { motion } from "framer-motion";
import { fadeInConfig } from "@/utils/animations";
import { NAVBAR_HEIGHT } from "@/constants";
import type { SponsorsSection } from "@/schemas/sponsorsSchema";
import SponsorsCarousel from "@/app/components/about/sponsors-carousel";
import type { GlueInternationalContent } from "@/schemas/internationalSchema";

type Props = {
  glueInternational: GlueInternationalContent;
  sponsorsData: SponsorsSection;
};

function LastPage({ glueInternational, sponsorsData }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  useScroll();

  // Check if both sections are not visible
  if (
    !glueInternational.is_visible &&
    !sponsorsData.sponsorsHeaderSchema.is_visible
  ) {
    return null; // Return null if both sections are not visible
  }

  return (
    <section
      ref={sectionRef}
      id="last"
      aria-label="last-page-content"
      aria-labelledby="last-page-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="min-h-screen bg-[var(--color-triangle)] snap-start relative overflow-y-auto flex flex-col"
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 space-y-4 w-full mx-auto about-w flex flex-col flex-grow justify-between py-8"
      >
        {glueInternational.is_visible && (
          <GlueInternational glueInternational={glueInternational} />
        )}
        {sponsorsData.sponsorsHeaderSchema.is_visible && (
          <SponsorsCarousel sponsorsData={sponsorsData} />
        )}
        <ScrollUp color="uiblack" href="#main" />
      </motion.article>
    </section>
  );
}

export default LastPage;
