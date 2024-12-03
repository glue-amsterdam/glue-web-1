"use client";

import useSWR from "swr";
import AboutCarouselSectionForm from "@/app/admin/forms/about-carousel-form";
import LoadingSpinner from "@/app/components/LoadingSpinner";
import { CarouselSection } from "@/schemas/carouselSchema";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AboutCarouselSection() {
  const {
    data: carouselData,
    error,
    isLoading,
  } = useSWR<CarouselSection>("/api/admin/about/carousel", fetcher);

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div>Failed to load carousel data</div>;
  if (!carouselData) return <div>No carousel data available</div>;

  return <AboutCarouselSectionForm initialData={carouselData} />;
}
