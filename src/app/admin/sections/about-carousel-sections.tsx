import { fetchAboutCarousel } from "@/utils/api/admin-api-calls";
import AboutCarouselSectionForm from "@/app/admin/forms/about-carousel-form";

export default async function AboutCarouselSection() {
  const carouselData = await fetchAboutCarousel();

  return <AboutCarouselSectionForm initialData={carouselData} />;
}
