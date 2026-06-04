"use client";

import type { ExhibitorCarouselSlide } from "@/lib/participants/exhibitor-carousel-slides";
import { useMediaQuery } from "@/hooks/userMediaQuery";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import { AnimatePresence, motion } from "framer-motion";
import ExhibitorProfileImage from "./exhibitor-profile-image";

const AUTOPLAY_DELAY_MS = 6000;

type Props = {
  slides: ExhibitorCarouselSlide[];
  ariaLabel: string;
  navAriaLabel?: string;
};

const ExhibitorImagesCarousel = ({
  slides,
  ariaLabel,
  navAriaLabel = "Gallery images",
}: Props) => {
  const {
    currentIndex,
    hasMultiple,
    handleMouseEnter,
    handleMouseLeave,
    handleSelect,
  } = useCyclicIndex({
    itemCount: slides.length,
    delayMs: AUTOPLAY_DELAY_MS,
  });

  const currentSlide = slides[currentIndex] ?? null;
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (slides.length === 0) {
    return null;
  }

  const navClassName = isDesktop
    ? "flex pt-[30px] gap-[15px] justify-center"
    : "flex pt-[30px] gap-[15px] justify-center w-full flex-wrap";

  const lineButtonClassName = (isActive: boolean) => {
    if (isDesktop) {
      return `h-2 w-[90px] shrink-0 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0 ${isActive ? "border-b-[3px]" : "border-b-[1px]"
        }`;
    }

    return `h-2 w-[90px] lg:w-[150px] shrink-0 cursor-pointer border-0 border-[var(--black-color)] bg-transparent p-0 ${isActive
        ? "border-b-[3px] lg:border-b-[4px]"
        : "border-b-[1px] lg:border-b-[2px]"
      }`;
  };

  return (
    <article
      className="pt-[40px] lg:pt-[60px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
    >
      <AnimatePresence mode="wait">
        {currentSlide && (
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            aria-live="polite"
            aria-atomic="true"
          >
            <ExhibitorProfileImage slide={currentSlide} />
          </motion.div>
        )}
      </AnimatePresence>

      {hasMultiple && (
        <nav aria-label={navAriaLabel} className={navClassName}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-current={index === currentIndex}
              aria-label={slide.label}
              onClick={() => handleSelect(index)}
              className={lineButtonClassName(index === currentIndex)}
            />
          ))}
        </nav>
      )}
    </article>
  );
};

export default ExhibitorImagesCarousel;
