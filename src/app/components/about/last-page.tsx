"use client";

import GlueInternational from "@/app/components/about/glue-international";
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
  if (
    !glueInternational.is_visible &&
    !sponsorsData.sponsorsHeaderSchema.is_visible
  ) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="last"
      aria-label="last-page-content"
      aria-labelledby="last-page-heading"
      style={{ paddingTop: `${NAVBAR_HEIGHT}rem` }}
      className="h-screen bg-[var(--color-triangle)] snap-start"
    >
      <motion.article
        {...fadeInConfig}
        className="z-20 w-full mx-auto about-w flex flex-col flex-grow justify-around h-full"
      >
        {glueInternational.is_visible && (
          <GlueInternational glueInternational={glueInternational} />
        )}
        {sponsorsData.sponsorsHeaderSchema.is_visible && (
          <SponsorsCarousel sponsorsData={sponsorsData} />
        )}
      </motion.article>
    </section>
  );
}

export default LastPage;
