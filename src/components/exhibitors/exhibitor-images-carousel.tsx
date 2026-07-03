"use client";

import type { ExhibitorCarouselSlide } from "@/lib/participants/exhibitor-carousel-slides";
import { useCyclicIndex } from "@/hooks/useCyclicIndex";
import PreloadedImageStack from "@/components/preloaded-image-stack";
import SlideLineNav from "@/components/slide-line-nav";

const AUTOPLAY_DELAY_MS = 3000;

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
    handleAdvance,
  } = useCyclicIndex({
    itemCount: slides.length,
    delayMs: AUTOPLAY_DELAY_MS,
  });

  if (slides.length === 0) {
    return null;
  }

  return (
    <article
      className="pt-[40px] lg:pt-[60px]"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
    >
      <div aria-live="polite" aria-atomic="true">
        <PreloadedImageStack
          slides={slides.map((slide) => ({
            id: slide.id,
            src: slide.imageUrl,
            alt: slide.label,
          }))}
          currentIndex={currentIndex}
          onAdvance={hasMultiple ? handleAdvance : undefined}
          className="relative mx-auto w-full max-w-[1045px] aspect-1045/674 lg:max-h-[674px] max-h-[339px]"
          sizes="(min-width: 1024px) 1045px, 100vw"
          objectFit="contain"
          objectPosition="top"
          align="center"
          fullWidth
        />
      </div>

      <SlideLineNav
        items={slides.map((slide) => ({ id: slide.id, label: slide.label }))}
        currentIndex={currentIndex}
        onSelect={handleSelect}
        ariaLabel={navAriaLabel}
        size="default"
      />
    </article>
  );
};

export default ExhibitorImagesCarousel;
