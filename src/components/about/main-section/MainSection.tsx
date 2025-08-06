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
      className="min-h-dvh py-[6rem] relative"
      style={{ backgroundColor: bgColor }}
    >
      <div
        aria-hidden="true"
        className="radial-gradient-background absolute inset-0 opacity-50 pointer-events-none z-10 overflow-hidden"
      />
      <h1
        id="about-main-heading"
        ref={titleRef}
        dangerouslySetInnerHTML={{ __html: sanitizedTitle }}
        style={{ color: text_color ?? "#fff" }}
        className="z-10 absolute px-4 text-5xl md:text-7xl lg:text-7xl xl:text-8xl w-full pointer-events-none text-pretty break-words"
      />
      <p
        id="carousel-description"
        ref={descriptionRef}
        dangerouslySetInnerHTML={{ __html: sanitizedDescription }}
        style={{ color: text_color ?? "#fff" }}
        className="about-description text-right w-full md:w-[80%] bottom-8 absolute right-0 px-2 z-10 text-pretty"
      />
      <ImageSlider ref={imageSliderRef} slides={slides} />
    </section>
  );
}
