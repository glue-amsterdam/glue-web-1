import CarouselSection from "@/app/components/about/carousel-section";
import { fetchUserCarousel } from "@/lib/about/fetch-carousel-section";
import React from "react";

async function AboutCarousel() {
  const carouselData = await fetchUserCarousel();
  return <CarouselSection carouselData={carouselData} />;
}

export default AboutCarousel;
