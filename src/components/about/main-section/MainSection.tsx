"use client";

import type React from "react";

import { useSanitizedHTML } from "@/app/hooks/useSanitizedHTML";
import type { CarouselClientType } from "@/schemas/carouselSchema";
import ImageSlider from "./ImageSlider";

export default function MainSection({
  carouselData,
  bgColor,
  sectionRef,
  titleRef,
  descriptionRef,
  imageSliderRef,
}: {
  carouselData: CarouselClientType;
  bgColor: string;
  sectionRef: React.RefObject<HTMLDivElement>;
  titleRef: React.RefObject<HTMLHeadingElement>;
  descriptionRef: React.RefObject<HTMLParagraphElement>;
  imageSliderRef: React.RefObject<HTMLDivElement>;
}) {
  const { title, description, text_color, slides } = carouselData;

  const sanitizedTitle = useSanitizedHTML(title);
  const sanitizedDescription = useSanitizedHTML(description);

  if (!carouselData || !carouselData.is_visible) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="main"
      aria-labelledby="about-main-heading carousel-description"
      className="min-h-dvh relative"
      style={{ backgroundColor: bgColor }}
    >
      <div className="relative w-full h-[80vh] py-[6rem]">
        <div
          aria-hidden="true"
          className="radial-gradient-background absolute inset-0 opacity-60 pointer-events-none z-20 overflow-hidden"
        />
        <h1
          id="about-main-heading"
          ref={titleRef}
          dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
          style={{ color: text_color ?? "#fff" }}
          className="z-10 absolute px-4 text-5xl md:text-7xl lg:text-7xl xl:text-8xl w-full pointer-events-none text-pretty break-words"
        />

        <ImageSlider ref={imageSliderRef} slides={slides} />
      </div>
      <p
        id="carousel-description"
        ref={descriptionRef}
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        style={{ color: text_color ?? "#fff" }}
        className="relative about-description columns-1 md:columns-2 lg:columns-3 gap-4 z-10 text-pretty h-full px-4 py-4"
      />
    </section>
  );
}
