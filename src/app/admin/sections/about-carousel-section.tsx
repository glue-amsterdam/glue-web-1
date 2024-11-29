import AboutCarouselSectionForm from "@/app/admin/forms/about-carousel-form";
import { fetchAboutCarousel } from "@/utils/api/admin-api-calls";

export default async function AboutCarouselSection() {
  const mainColors = await fetchAboutCarousel();

  return <AboutCarouselSectionForm initialData={mainColors} />;
}
